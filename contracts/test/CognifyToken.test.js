// // test/CognifyToken.test.js
// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("CognifyToken (CGFY)", function () {
//     let token, owner, addr1;

//     beforeEach(async () => {
//         [owner, addr1] = await ethers.getSigners();
//         const Token = await ethers.getContractFactory("CognifyToken");
//         token = await Token.deploy();
//         await token.waitForDeployment();
//     });

//     it("mints 1 billion tokens to deployer", async () => {
//         const ownerBal = await token.balanceOf(owner.address);
//         expect(ownerBal).to.equal(
//             ethers.parseUnits("1000000000", 18)
//         );
//     });

//     it("lets users burn their tokens", async () => {
//         await token.transfer(
//             addr1.address,
//             ethers.parseUnits("1000", 18)
//         );
//         await token.connect(addr1).burn(
//             ethers.parseUnits("500", 18)
//         );
//         const bal = await token.balanceOf(addr1.address);
//         expect(bal).to.equal(
//             ethers.parseUnits("500", 18)
//         );
//     });
// });
