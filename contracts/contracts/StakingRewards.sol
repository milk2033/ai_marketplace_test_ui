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

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    mapping(address => UserInfo) public userInfo;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

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

    function stake(uint256 amount) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(amount > 0, "Cannot stake 0");
        // sync global reward state
        updatePool();
        //pay out earned rewards
        if (user.amount > 0) {
            uint256 pending = (user.amount * accRewardPerShare) /
                1e12 -
                user.rewardDebt;
            if (pending > 0) {
                rewardToken.safeTransfer(msg.sender, pending);
                emit RewardPaid(msg.sender, pending);
            }
        }

        //update staked balances
        user.amount += amount;
        totalStaked += amount;

        //reset rewardDebt to the user's new checkpoint
        user.rewardDebt = (user.amount * accRewardPerShare) / 1e12;
        //pull in new staking tokens
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        //emit the staking event
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= amount, "Withdrawal amount exceeds balance");
        require(amount > 0, "Cannot withdraw 0");
        updatePool();
        uint256 pending = (user.amount * accRewardPerShare) /
            1e12 -
            user.rewardDebt;
        if (pending > 0) {
            rewardToken.safeTransfer(msg.sender, pending);
            emit RewardPaid(msg.sender, pending);
        }

        user.amount -= amount;
        totalStaked -= amount;
        user.rewardDebt = (user.amount * accRewardPerShare) / 1e12;
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount > 0, "No staked balance");

        updatePool();

        uint256 pending = (user.amount * accRewardPerShare) /
            1e12 -
            user.rewardDebt;
        user.rewardDebt = (user.amount * accRewardPerShare) / 1e12;
        if (pending > 0) {
            rewardToken.safeTransfer(msg.sender, pending);
            emit RewardPaid(msg.sender, pending);
        }
    }

    function pendingReward(
        address account
    ) external view returns (uint256 pending) {
        UserInfo storage user = userInfo[account];

        uint256 _accRewardPerShare = accRewardPerShare;
        uint256 supply = totalStaked;
        uint256 current = block.number;

        if (current > lastRewardBlock && supply != 0) {
            uint256 toBlock = current < endBlock ? current : endBlock;
            uint256 blocks = toBlock - lastRewardBlock;
            uint256 reward = blocks * rewardPerBlock;
            _accRewardPerShare += (reward * 1e12) / supply;
        }

        pending = (user.amount * _accRewardPerShare) / 1e12 - user.rewardDebt;
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
