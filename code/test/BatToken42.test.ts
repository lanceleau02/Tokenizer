import { expect } from "chai";
import { ethers } from "hardhat";

describe("BatToken42", function () {
  // We define a fixture to reuse the same setup in every test.
  // This makes tests run faster and keeps the code clean.
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract
    const Token = await ethers.getContractFactory("BatToken42");
    const batToken = await Token.deploy();

    return { batToken, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      // 1. Arrange: Setup the test (deploy contract)
      const { batToken } = await deployTokenFixture();
      
      // 2. Act & Assert: Check the state
      expect(await batToken.name()).to.equal("BatToken42");
      expect(await batToken.symbol()).to.equal("BT42");
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const { batToken, owner } = await deployTokenFixture();
      
      const ownerBalance = await batToken.balanceOf(owner.address);
      const totalSupply = await batToken.totalSupply();
      
      expect(ownerBalance).to.equal(totalSupply);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { batToken, addr1, addr2 } = await deployTokenFixture();

      // Transfer 50 tokens from owner to addr1
      await batToken.transfer(addr1.address, 50);
      expect(await batToken.balanceOf(addr1.address)).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(addr1) to send a transaction from another account
      await batToken.connect(addr1).transfer(addr2.address, 50);
      expect(await batToken.balanceOf(addr2.address)).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { batToken, owner, addr1 } = await deployTokenFixture();
      const initialOwnerBalance = await batToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 balance) to owner.
      // `require` will evaluate false and revert the transaction.
      await expect(
        batToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("Balance is too low");

      // Owner balance shouldn't have changed.
      expect(await batToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("Allowances", function () {
    it("Should allow addr1 to authorize addr2 to spend 100 tokens", async function () {
      const {batToken, addr1, addr2} = await deployTokenFixture();
      
      await batToken.transfer(addr2.address, 100);
      expect(await batToken.balanceOf(addr2.address)).to.equal(100);

      await batToken.connect(addr1).approve(addr2.address, 100)
      expect(await batToken.allowance(addr1.address, addr2.address)).to.equal(100);
    });

    it("Should allow addr2 to call `transferFrom` to move 50 tokens from addr1 to owner", async function () {
      const {batToken, owner, addr1, addr2} = await deployTokenFixture();

      await batToken.transfer(addr1.address, 50);
      expect(await batToken.balanceOf(addr1.address)).to.equal(50);

      await batToken.connect(addr1).approve(addr2.address, 50);

      await batToken.connect(addr2).transferFrom(addr1.address, owner.address, 50);
      expect(await batToken.balanceOf(owner.address)).to.equal((await batToken.totalSupply()));
      expect(await batToken.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should fail (reverts) if addr2 tries to transfer more than their approved allowance", async function () {
      const {batToken, owner, addr1, addr2} = await deployTokenFixture();

      await batToken.transfer(addr1.address, 150);
      expect(await batToken.balanceOf(addr1.address)).to.equal(150);

      await batToken.connect(addr1).approve(addr2.address, 50);

      await expect(
        batToken.connect(addr2).transferFrom(addr1.address, owner.address, 100)
      ).to.be.revertedWith("Allowance is too low");
    });

    it("Should fail when the owner's balance is too low, even if the allowance is high enough", async function () {
      const {batToken, owner, addr1, addr2} = await deployTokenFixture();

      await batToken.transfer(addr1.address, 5);
      expect(await batToken.balanceOf(addr1.address)).to.equal(5);

      await batToken.connect(addr1).approve(addr2.address, 1000);
      expect(await batToken.allowance(addr1.address, addr2.address)).to.equal(1000);

      await expect(
        batToken.connect(addr2).transferFrom(addr1.address, owner.address, 1000)
      ).to.be.revertedWith("Balance is too low");
    });
  });

  describe("`mint()`", function () {
    it("Should increase the balance of the target address by the exact amount specified", async function (){
      const {batToken, addr1} = await deployTokenFixture();
      const totalSupply = await batToken.totalSupply();

      await batToken.mint(addr1.address, 100);
      expect(await batToken.balanceOf(addr1.address)).to.equal(100);
      expect(await batToken.totalSupply()).to.equal(totalSupply + 100n);
    });

    it("Should emit a Transfer event where the from address is the Zero Address", async function (){
      const {batToken, addr1} = await deployTokenFixture();

      await expect(
        batToken.connect(addr1).mint(addr1.address, 100)
      ).to.emit(batToken, "Transfer").withArgs(ethers.ZeroAddress, addr1.address, 100);
    });
  });

  describe("`burn()`", function () {
    it("Should destroy the tokens and decrease the caller's balance", async function (){
      const {batToken, owner} = await deployTokenFixture();
      const totalSupply = await batToken.totalSupply();

      await batToken.burn(owner.address, 100);
      expect(await batToken.balanceOf(owner.address)).to.equal(totalSupply - 100n);
      expect(await batToken.totalSupply()).to.equal(totalSupply - 100n);
    });

    it("Should revert with an error if the user tries to burn more tokens than they actually own", async function (){
      const {batToken, addr1} = await deployTokenFixture();

      await batToken.transfer(addr1.address, 5);
      expect(await batToken.balanceOf(addr1.address)).to.equal(5);

      await expect(
        batToken.connect(addr1).burn(addr1.address, 10)
      ).to.be.revertedWith("Balance is too low");
    });
  });
});
