// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// Use local ReentrancyGuard copy
import "./security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingRewards is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;

    uint256 public startBlock;
    uint256 public endBlock;
    uint256 public rewardPerBlock;
    uint256 public lastRewardBlock;
    uint256 public accRewardPerShare;
    uint256 public totalStaked;

    uint256 public revAccPerShare;
    mapping(address => uint256) public revRewardDebt;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    mapping(address => UserInfo) public userInfo;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    event RevShareDeposited(uint256 amount);
    event RevSharePaid(address indexed user, uint256 amount);

    constructor(
        IERC20 _stakingToken,
        IERC20 _rewardToken,
        uint256 _startBlock,
        uint256 _endBlock,
        uint256 _rewardPerBlock
    ) Ownable(msg.sender) {
        require(_startBlock < _endBlock, "Invalid block range");
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        startBlock = _startBlock;
        endBlock = _endBlock;
        rewardPerBlock = _rewardPerBlock;
        lastRewardBlock = _startBlock;
    }

    function distributeRevShare() external payable {
        require(msg.value > 0, "no revshare");
        require(totalStaked > 0, "no stakers");

        revAccPerShare += (msg.value * 1e12) / totalStaked;
        emit RevShareDeposited(msg.value);
    }

    function updatePool() public {
        uint256 current = block.number;
        if (current <= lastRewardBlock) return;
        uint256 supply = totalStaked;
        if (supply == 0) {
            lastRewardBlock = current;
            return;
        }
        uint256 toBlock = current < endBlock ? current : endBlock;
        uint256 blocks = toBlock - lastRewardBlock;
        uint256 reward = blocks * rewardPerBlock;
        accRewardPerShare += (reward * 1e12) / supply;
        lastRewardBlock = toBlock;
    }

    function _payPending(address userAddr) internal {
        UserInfo storage user = userInfo[userAddr];

        // 1) CGFY drip
        uint256 pending = (user.amount * accRewardPerShare) /
            1e12 -
            user.rewardDebt;
        if (pending > 0) {
            rewardToken.safeTransfer(userAddr, pending);
            emit RewardPaid(userAddr, pending);
        }

        // 2) ETH rev‐share
        uint256 revPending = (user.amount * revAccPerShare) /
            1e12 -
            revRewardDebt[userAddr];
        if (revPending > 0) {
            payable(userAddr).transfer(revPending);
            emit RevSharePaid(userAddr, revPending);
        }
    }

    function stake(uint256 amount) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(amount > 0, "Cannot stake 0");
        // sync global reward state
        updatePool();
        _payPending(msg.sender);

        // pull in tokens
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        // update staking balance
        user.amount += amount;
        totalStaked += amount;

        // re‐establish debts
        user.rewardDebt = (user.amount * accRewardPerShare) / 1e12;
        revRewardDebt[msg.sender] = (user.amount * revAccPerShare) / 1e12;

        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= amount, "Withdraw > balance");
        require(amount > 0, "Cannot withdraw 0");

        updatePool();
        _payPending(msg.sender);

        // update balances
        user.amount -= amount;
        totalStaked -= amount;
        stakingToken.safeTransfer(msg.sender, amount);

        // reset debts
        user.rewardDebt = (user.amount * accRewardPerShare) / 1e12;
        revRewardDebt[msg.sender] = (user.amount * revAccPerShare) / 1e12;

        emit Withdrawn(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount > 0, "No stake");

        updatePool();
        _payPending(msg.sender);

        // reset debts
        user.rewardDebt = (user.amount * accRewardPerShare) / 1e12;
        revRewardDebt[msg.sender] = (user.amount * revAccPerShare) / 1e12;
    }

    function pendingReward(
        address account
    ) external view returns (uint256 pending) {
        UserInfo storage user = userInfo[account];
        uint256 _acc = accRewardPerShare;
        uint256 supply = totalStaked;
        uint256 current = block.number;

        if (current > lastRewardBlock && supply != 0) {
            uint256 toBlock = current < endBlock ? current : endBlock;
            uint256 blocks = toBlock - lastRewardBlock;
            uint256 reward = blocks * rewardPerBlock;
            _acc += (reward * 1e12) / supply;
        }

        pending = (user.amount * _acc) / 1e12 - user.rewardDebt;
    }

    function pendingRevShare(
        address account
    ) external view returns (uint256 pending) {
        UserInfo storage user = userInfo[account];
        uint256 _acc = revAccPerShare;
        pending = (user.amount * _acc) / 1e12 - revRewardDebt[account];
    }

    /** 
    @notice Recover leftover reward tokens after the end block
*/
    function rescueTokens(address to) external onlyOwner {
        require(block.number > endBlock, "Rewards not ended");
        uint256 balance = rewardToken.balanceOf(address(this));
        rewardToken.safeTransfer(to, balance);
    }
}
