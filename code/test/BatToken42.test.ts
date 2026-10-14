import { expect } from "chai";
import { ethers } from "hardhat";

describe("🦇 BatToken42", function () {
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("BatToken42");
    const batToken = await Token.deploy(1000000);

    return { batToken, owner, addr1, addr2 };
  }

  describe("🚀 Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { batToken } = await deployTokenFixture();

      expect(await batToken.name()).to.equal("BatToken42");
      expect(await batToken.symbol()).to.equal("BT42");
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const { batToken, owner } = await deployTokenFixture();
      
      const ownerBalance = await batToken.balanceOf(owner.address);
      const totalSupply = await batToken.totalSupply();
      
      expect(ownerBalance).to.equal(totalSupply);
    });

    it("Should set the correct total supply with decimals", async function () {
      const { batToken } = await deployTokenFixture();

      const totalSupply = await batToken.totalSupply();
      const decimals = await batToken.decimals();

      const expectedSupply = ethers.parseUnits("1000000", decimals);
      expect(totalSupply).to.equal(expectedSupply);
    });

    it("Should set the deployer as the owner", async function () {
      const { batToken, owner } = await deployTokenFixture();

      expect(await batToken.owner()).to.equal(owner.address);
    });
  });
  
  describe("💸 Supply Consistency", function () {
    it("Should keep totalSupply consistent after mint() and burn() operations", async function() {
      const { batToken, owner, addr1 } = await deployTokenFixture();
      const totalSupply = await batToken.totalSupply();

      await batToken.connect(owner).mint(addr1, 50);
      await batToken.connect(owner).burn(50);
      await batToken.connect(owner).mint(addr1, 100);
      await batToken.connect(owner).burn(100);
      expect(await batToken.totalSupply()).to.equal(totalSupply);
    });
    
    it("Should bring totalSupply to 0 if all tokens are burned", async function() {
      const { batToken, owner } = await deployTokenFixture();

      await batToken.connect(owner).burn(await batToken.totalSupply());
      expect(await batToken.totalSupply()).to.equal(0);
    });
  });

  describe("🔄 Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { batToken, addr1, addr2 } = await deployTokenFixture();

      await batToken.transfer(addr1.address, 50);
      expect(await batToken.balanceOf(addr1.address)).to.equal(50);

      await batToken.connect(addr1).transfer(addr2.address, 50);
      expect(await batToken.balanceOf(addr2.address)).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { batToken, owner, addr1 } = await deployTokenFixture();
      const initialOwnerBalance = await batToken.balanceOf(owner.address);

      await expect(
        batToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("Balance is too low");

      expect(await batToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
    
    it("Should transfer 0 tokens", async function() {
      const { batToken, owner, addr1 } = await deployTokenFixture();

      await expect(
        batToken.connect(owner).transfer(addr1.address, 0)
      ).to.emit(batToken, "Transfer");
    });
    
    it("Should transfer the entire balance", async function() {
      const { batToken, owner, addr1, addr2 } = await deployTokenFixture();
      
      await batToken.connect(owner).transfer(addr1, 50);
      await batToken.connect(addr1).transfer(addr2, await batToken.balanceOf(addr1.address));
      expect(await batToken.balanceOf(addr1.address)).to.equal(0);
    });
  });

  describe("✅ Allowances", function () {
    it("Should allow addr1 to authorize addr2 to spend 100 tokens", async function () {
      const { batToken, addr1, addr2 } = await deployTokenFixture();
      
      await batToken.transfer(addr2.address, 100);
      expect(await batToken.balanceOf(addr2.address)).to.equal(100);

      await batToken.connect(addr1).approve(addr2.address, 100)
      expect(await batToken.allowance(addr1.address, addr2.address)).to.equal(100);
    });

    it("Should allow addr2 to call `transferFrom` to move 50 tokens from addr1 to owner", async function () {
      const { batToken, owner, addr1, addr2 } = await deployTokenFixture();

      await batToken.transfer(addr1.address, 50);
      expect(await batToken.balanceOf(addr1.address)).to.equal(50);

      await batToken.connect(addr1).approve(addr2.address, 50);

      await batToken.connect(addr2).transferFrom(addr1.address, owner.address, 50);
      expect(await batToken.balanceOf(owner.address)).to.equal((await batToken.totalSupply()));
      expect(await batToken.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should fail if addr2 tries to transfer more than their approved allowance", async function () {
      const { batToken, owner, addr1, addr2 } = await deployTokenFixture();

      await batToken.transfer(addr1.address, 150);
      expect(await batToken.balanceOf(addr1.address)).to.equal(150);

      await batToken.connect(addr1).approve(addr2.address, 50);

      await expect(
        batToken.connect(addr2).transferFrom(addr1.address, owner.address, 100)
      ).to.be.revertedWith("Allowance is too low");
    });

    it("Should fail when the owner's balance is too low, even if the allowance is high enough", async function () {
      const { batToken, owner, addr1, addr2 } = await deployTokenFixture();

      await batToken.transfer(addr1.address, 5);
      expect(await batToken.balanceOf(addr1.address)).to.equal(5);

      await batToken.connect(addr1).approve(addr2.address, 1000);
      expect(await batToken.allowance(addr1.address, addr2.address)).to.equal(1000);

      await expect(
        batToken.connect(addr2).transferFrom(addr1.address, owner.address, 1000)
      ).to.be.revertedWith("Balance is too low");
    });
    
    it("Should overwrite the previous allowance when approve() is called again", async function() {
      const {batToken, owner, addr1 } = await deployTokenFixture();

      await batToken.connect(owner).approve(addr1.address, 50);
      await batToken.connect(owner).approve(addr1.address, 100);
      
      expect(await batToken.allowance(owner, addr1.address)).to.equal(100);
    });
    
    it("Should decrease the allowance after a transferFrom()", async function() {
      const { batToken, owner, addr1, addr2 } = await deployTokenFixture();

      await batToken.connect(owner).approve(addr1.address, 50);
      await batToken.connect(addr1).transferFrom(owner, addr2, 25);
      expect(await batToken.allowance(owner, addr1.address)).to.equal(25);
    });
    
    it("Should revoke the allowance when approved amount is set to 0", async function() {
      const { batToken, owner, addr1, addr2 } = await deployTokenFixture();

      await batToken.connect(owner).approve(addr1.address, 50);
      await batToken.connect(owner).approve(addr1.address, 0);
      expect(await batToken.allowance(owner, addr1.address)).to.equal(0);
      await expect(
        batToken.connect(addr1).transferFrom(owner, addr2, 50)
      ).to.be.revertedWith("Allowance is too low");
    });
  });

  describe("🆕 `mint()`", function () {
    it("Should increase the balance of the target address by the exact amount specified", async function (){
      const { batToken, addr1 } = await deployTokenFixture();
      const totalSupply = await batToken.totalSupply();

      await batToken.mint(addr1.address, 100);
      expect(await batToken.balanceOf(addr1.address)).to.equal(100);
      expect(await batToken.totalSupply()).to.equal(totalSupply + 100n);
    });

    it("Should emit a Transfer event where the from address is the Zero Address", async function (){
      const { batToken, owner } = await deployTokenFixture();

      await expect(
        batToken.connect(owner).mint(owner.address, 100)
      ).to.emit(batToken, "Transfer").withArgs(ethers.ZeroAddress, owner.address, 100);
    });

    it("Should fail if the caller is not the owner", async function (){
      const { batToken, addr1 } = await deployTokenFixture();

      await expect(
        batToken.connect(addr1).mint(addr1.address, 100)
      ).to.be.revertedWith("Not the owner");
    });

    it("Should revert if a non-owner tries to mint", async function (){
      const { batToken, addr1 } = await deployTokenFixture();

      await expect(
        batToken.connect(addr1).mint(addr1.address, 100)
      ).to.be.revertedWith("Not the owner");
    });
    
    it("Should mint 0 tokens", async function () {
      const { batToken, owner, addr1 } = await deployTokenFixture();

      expect(batToken.connect(owner).mint(addr1, 0));
    });
  });

  describe("🔥 `burn()`", function () {
    it("Should destroy the tokens and decrease the caller's balance", async function (){
      const { batToken, owner } = await deployTokenFixture();
      const totalSupply = await batToken.totalSupply();

      await batToken.burn(100);
      expect(await batToken.balanceOf(owner.address)).to.equal(totalSupply - 100n);
      expect(await batToken.totalSupply()).to.equal(totalSupply - 100n);
    });

    it("Should revert with an error if the user tries to burn more tokens than they actually own", async function (){
      const { batToken, addr1 } = await deployTokenFixture();

      await batToken.transfer(addr1.address, 5);
      expect(await batToken.balanceOf(addr1.address)).to.equal(5);

      await expect(
        batToken.connect(addr1).burn(10)
      ).to.be.revertedWith("Balance is too low");
    });
    
    it("Should burn 0 tokens", async function() {
      const { batToken, owner } = await deployTokenFixture();

      expect(batToken.connect(owner).burn(0));
    });
  });

  describe("📣 Events", function () {
    it("Should emit a Transfer event on transfer()", async function (){
      const { batToken, owner, addr1 } = await deployTokenFixture();

      await batToken.transfer(addr1.address, 50);
      expect(await batToken.balanceOf(addr1.address)).to.equal(50);

      await expect(
        batToken.connect(addr1).transfer(owner.address, 50)
      ).to.emit(batToken, "Transfer");
    });

    it("Should emit an Approval event on approve()", async function (){
      const { batToken, addr1, addr2 } = await deployTokenFixture();
      
      await batToken.transfer(addr2.address, 100);
      expect(await batToken.balanceOf(addr2.address)).to.equal(100);

      await expect(
        batToken.connect(addr1).approve(addr2.address, 50)
      ).to.emit(batToken, "Approval");
    });

    it("Should emit a Transfer event to zero address on burn()", async function (){
      const { batToken, owner } = await deployTokenFixture();

      await expect(
        batToken.connect(owner).burn(100)
      ).to.emit(batToken, "Transfer").withArgs(owner.address, ethers.ZeroAddress, 100);
    });

    it("Should emit a Transfer event on transferFrom()", async function () {
      const { batToken, owner, addr1, addr2 } = await deployTokenFixture();

      await batToken.transfer(addr1.address, 50);
      expect(await batToken.balanceOf(addr1.address)).to.equal(50);

      await batToken.connect(addr1).approve(addr2.address, 50);

      await expect(
        batToken.connect(addr2).transferFrom(addr1.address, owner.address, 50)
      ).to.emit(batToken, "Transfer");
    });
  });

  describe("🚫 Zero Address", function () {
    it("Should revert when transferring to the zero address", async function() {
      const { batToken, owner } = await deployTokenFixture();

      await expect(
        batToken.connect(owner).transfer(ethers.ZeroAddress, 1)
      ).to.be.revertedWith("Transfer to zero address");
    });
    
    it("Should revert when approving the zero address", async function() {
      const { batToken, addr1 } = await deployTokenFixture();

      await expect(
        batToken.connect(addr1).approve(ethers.ZeroAddress, 100)
      ).to.be.revertedWith("Approve to zero address");
    });
    
    it("Should revert when minting to the zero address", async function() {
      const { batToken, owner } = await deployTokenFixture();

      await expect(
        batToken.connect(owner).mint(ethers.ZeroAddress, 100)
      ).to.be.revertedWith("Mint to zero address");
    });
  });
});
