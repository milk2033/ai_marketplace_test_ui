// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRevShare {
    function distributeRevShare() external payable;
}

contract LoraMarketplace {
    uint256 public modelCount = 0;
    uint256 public revShareBP; //rev share in basis points
    address public revShareReceiver; //staking rewards contract

    struct Model {
        uint256 id;
        string name;
        string downloadUrl;
        address payable creator;
        uint256 price; //in wei
        uint256 purchases;
    }

    mapping(uint256 => Model) public models;

    event ModelUploaded(
        uint256 indexed id,
        string name,
        address indexed creator,
        uint256 price
    );
    event ModelPurchased(
        uint256 indexed id,
        address indexed buyer,
        uint256 revShare
    );

    constructor(uint256 _revShareBP, address _revShareReceiver) {
        require(_revShareBP <= 10000, "bp > 100%");
        revShareBP = _revShareBP;
        revShareReceiver = _revShareReceiver;
    }

    function uploadModel(
        string memory _name,
        string memory _downloadUrl,
        uint256 _price
    ) public {
        modelCount++;
        models[modelCount] = Model({
            id: modelCount,
            name: _name,
            downloadUrl: _downloadUrl,
            creator: payable(msg.sender),
            price: _price,
            purchases: 0
        });

        emit ModelUploaded(modelCount, _name, msg.sender, _price);
    }

    function buyModel(uint256 _id) public payable {
        Model storage model = models[_id];
        require(msg.value >= model.price, "Insufficient payment");

        uint256 revShare = (msg.value * revShareBP) / 10_000;
        uint256 sellerAmt = msg.value - revShare;

        IRevShare(revShareReceiver).distributeRevShare{value: revShare}();

        model.creator.transfer(sellerAmt);
        model.purchases++;

        emit ModelPurchased(_id, msg.sender, revShare);
    }

    function getModel(uint256 _id) public view returns (Model memory) {
        return models[_id];
    }
}
