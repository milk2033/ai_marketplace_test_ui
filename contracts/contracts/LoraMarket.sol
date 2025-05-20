// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LoraMarketplace {
    uint256 public modelCount = 0;

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
    event ModelPurchased(uint256 indexed id, address indexed buyer);

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

        model.creator.transfer(msg.value);
        model.purchases++;

        emit ModelPurchased(_id, msg.sender);
    }

    function getModel(uint256 _id) public view returns (Model memory) {
        return models[_id];
    }
}
