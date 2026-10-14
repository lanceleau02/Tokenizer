import { expect } from "chai";
import { ethers } from "hardhat";

describe("👛 MultiSigWallet", function () {
  async function deployFixture() {
    const [owner, addr1, addr2, addr3, recipient] = await ethers.getSigners();
  
    const MultiSigFactory = await ethers.getContractFactory("MultiSigWallet");
    const multiSigWallet = await MultiSigFactory.deploy(
      [owner.address, addr1.address, addr2.address],
      2
    );

    const TokenFactory = await ethers.getContractFactory("BatToken42");
    const batToken = await TokenFactory.deploy(1000000);

    return { multiSigWallet, batToken, owner, addr1, addr2, addr3, recipient };
  }

  describe("🚀 Deployment & Settings", function () {
    it("Should set the correct owners and confirmation threshold", async function () {
      const { multiSigWallet, owner, addr1, addr2 } = await deployFixture();

      expect(await multiSigWallet.isOwner(owner.address)).to.be.true;
      expect(await multiSigWallet.isOwner(addr1.address)).to.be.true;
      expect(await multiSigWallet.isOwner(addr2.address)).to.be.true;
      expect(await multiSigWallet.numConfirmationsRequired()).to.equal(2);
    });

    it("Should set the owners array correctly", async function () {
      const { multiSigWallet, owner, addr1, addr2 } = await deployFixture();
      const ownersList = await multiSigWallet.getOwners();
      expect(ownersList.length).to.equal(3);
      expect(ownersList[0]).to.equal(owner.address);
      expect(ownersList[1]).to.equal(addr1.address);
      expect(ownersList[2]).to.equal(addr2.address);
    });

    it("Should fail on invalid constructor arguments", async function () {
      const { owner } = await deployFixture();
      const MultiSigFactory = await ethers.getContractFactory("MultiSigWallet");

      // Case 1: Empty owners array
      await expect(MultiSigFactory.deploy([], 1)).to.be.revertedWith("Owners required");

      // Case 2: Insufficient confirmations (0)
      await expect(MultiSigFactory.deploy([owner.address], 0)).to.be.revertedWith(
        "Invalid number of required confirmations"
      );

      // Case 3: Required confirmations greater than owners length
      await expect(MultiSigFactory.deploy([owner.address], 2)).to.be.revertedWith(
        "Invalid number of required confirmations"
      );

      // Case 4: Duplicate owners
      await expect(
        MultiSigFactory.deploy([owner.address, owner.address], 1)
      ).to.be.revertedWith("Owner address is not unique");

      // Case 5: Contains zero address
      await expect(
        MultiSigFactory.deploy([owner.address, ethers.ZeroAddress], 1)
      ).to.be.revertedWith("Invalid owner address");
    });
  });

  describe("📥 Deposits", function () {
    it("Should accept deposits and emit a Deposit event", async function () {
      const { multiSigWallet, owner } = await deployFixture();
      const amount = ethers.parseEther("1.0");

      await expect(
        owner.sendTransaction({
          to: await multiSigWallet.getAddress(),
          value: amount
        })
      ).to.emit(multiSigWallet, "Deposit")
       .withArgs(owner.address, amount, amount);
    });
  });

  describe("📝 Submitting Transactions", function () {
    it("Should allow any owner to submit a transaction", async function () {
      const { multiSigWallet, owner, recipient } = await deployFixture();
      const value = ethers.parseEther("0.1");
      const data = "0x";

      await expect(
        multiSigWallet.connect(owner).submitTransaction(recipient.address, value, data)
      ).to.emit(multiSigWallet, "SubmitTransaction")
       .withArgs(owner.address, 0, recipient.address, value, data);

      expect(await multiSigWallet.getTransactionCount()).to.equal(1);

      const tx = await multiSigWallet.getTransaction(0);
      expect(tx.to).to.equal(recipient.address);
      expect(tx.value).to.equal(value);
      expect(tx.data).to.equal(data);
      expect(tx.executed).to.be.false;
      expect(tx.numConfirmations).to.equal(0);
    });

    it("Should prevent non-owners from submitting transactions", async function () {
      const { multiSigWallet, addr3, recipient } = await deployFixture();
      await expect(
        multiSigWallet.connect(addr3).submitTransaction(recipient.address, 0, "0x")
      ).to.be.revertedWith("Not an owner");
    });
  });

  describe("✅ Confirming Transactions", function () {
    it("Should allow owners to confirm a transaction", async function () {
      const { multiSigWallet, owner, addr1, recipient } = await deployFixture();
      
      await multiSigWallet.connect(owner).submitTransaction(recipient.address, 0, "0x");

      await expect(multiSigWallet.connect(owner).confirmTransaction(0))
        .to.emit(multiSigWallet, "ConfirmTransaction")
        .withArgs(owner.address, 0);

      let tx = await multiSigWallet.getTransaction(0);
      expect(tx.numConfirmations).to.equal(1);
      expect(await multiSigWallet.isConfirmed(0, owner.address)).to.be.true;

      await expect(multiSigWallet.connect(addr1).confirmTransaction(0))
        .to.emit(multiSigWallet, "ConfirmTransaction")
        .withArgs(addr1.address, 0);

      tx = await multiSigWallet.getTransaction(0);
      expect(tx.numConfirmations).to.equal(2);
      expect(await multiSigWallet.isConfirmed(0, addr1.address)).to.be.true;
    });

    it("Should prevent non-owners from confirming", async function () {
      const { multiSigWallet, owner, addr3, recipient } = await deployFixture();
      
      await multiSigWallet.connect(owner).submitTransaction(recipient.address, 0, "0x");

      await expect(
        multiSigWallet.connect(addr3).confirmTransaction(0)
      ).to.be.revertedWith("Not an owner");
    });

    it("Should prevent double-confirmations", async function () {
      const { multiSigWallet, owner, recipient } = await deployFixture();
      
      await multiSigWallet.connect(owner).submitTransaction(recipient.address, 0, "0x");
      await multiSigWallet.connect(owner).confirmTransaction(0);

      await expect(
        multiSigWallet.connect(owner).confirmTransaction(0)
      ).to.be.revertedWith("Transaction already confirmed by you");
    });

    it("Should fail when confirming non-existent transactions", async function () {
      const { multiSigWallet, owner } = await deployFixture();
      await expect(
        multiSigWallet.connect(owner).confirmTransaction(99)
      ).to.be.revertedWith("Transaction does not exist");
    });
  });

  describe("🔄 Revoking Confirmations", function () {
    it("Should allow an owner to revoke their confirmation", async function () {
      const { multiSigWallet, owner, recipient } = await deployFixture();
      
      await multiSigWallet.connect(owner).submitTransaction(recipient.address, 0, "0x");
      await multiSigWallet.connect(owner).confirmTransaction(0);

      await expect(multiSigWallet.connect(owner).revokeConfirmation(0))
        .to.emit(multiSigWallet, "RevokeConfirmation")
        .withArgs(owner.address, 0);

      const tx = await multiSigWallet.getTransaction(0);
      expect(tx.numConfirmations).to.equal(0);
      expect(await multiSigWallet.isConfirmed(0, owner.address)).to.be.false;
    });

    it("Should prevent revoking if confirmation was never given", async function () {
      const { multiSigWallet, owner, addr1, recipient } = await deployFixture();
      
      await multiSigWallet.connect(owner).submitTransaction(recipient.address, 0, "0x");

      await expect(
        multiSigWallet.connect(addr1).revokeConfirmation(0)
      ).to.be.revertedWith("Transaction not confirmed by you");
    });

    it("Should prevent non-owners from revoking", async function () {
      const { multiSigWallet, owner, addr3, recipient } = await deployFixture();
      
      await multiSigWallet.connect(owner).submitTransaction(recipient.address, 0, "0x");
      await expect(
        multiSigWallet.connect(addr3).revokeConfirmation(0)
      ).to.be.revertedWith("Not an owner");
    });
  });

  describe("🚀 Executing Transactions", function () {
    it("Should allow execution of a fully-confirmed transaction (Ether transfer)", async function () {
      const { multiSigWallet, owner, addr1, recipient } = await deployFixture();
      const sendValue = ethers.parseEther("0.5");

      // 1. Fund MultiSigWallet
      await owner.sendTransaction({
        to: await multiSigWallet.getAddress(),
        value: ethers.parseEther("1.0")
      });

      // 2. Submit transaction
      await multiSigWallet.connect(owner).submitTransaction(recipient.address, sendValue, "0x");

      // 3. Confirmations (need 2)
      await multiSigWallet.connect(owner).confirmTransaction(0);
      await multiSigWallet.connect(addr1).confirmTransaction(0);

      // 4. Execution
      const beforeBalance = await ethers.provider.getBalance(recipient.address);

      await expect(multiSigWallet.connect(owner).executeTransaction(0))
        .to.emit(multiSigWallet, "ExecuteTransaction")
        .withArgs(owner.address, 0);

      const afterBalance = await ethers.provider.getBalance(recipient.address);
      expect(afterBalance - beforeBalance).to.equal(sendValue);

      const tx = await multiSigWallet.getTransaction(0);
      expect(tx.executed).to.be.true;
    });

    it("Should prevent execution if confirmation threshold is not met", async function () {
      const { multiSigWallet, owner, recipient } = await deployFixture();
      
      await multiSigWallet.connect(owner).submitTransaction(recipient.address, 0, "0x");
      await multiSigWallet.connect(owner).confirmTransaction(0); // Only 1 confirmation, threshold is 2

      await expect(
        multiSigWallet.connect(owner).executeTransaction(0)
      ).to.be.revertedWith("Not enough confirmations");
    });

    it("Should prevent double-execution", async function () {
      const { multiSigWallet, owner, addr1, recipient } = await deployFixture();
      
      await multiSigWallet.connect(owner).submitTransaction(recipient.address, 0, "0x");
      await multiSigWallet.connect(owner).confirmTransaction(0);
      await multiSigWallet.connect(addr1).confirmTransaction(0);

      await multiSigWallet.connect(owner).executeTransaction(0);

      await expect(
        multiSigWallet.connect(owner).executeTransaction(0)
      ).to.be.revertedWith("Transaction already executed");
    });
  });

  describe("🏆 Token Governance Integration (DAO)", function () {
    it("Should govern the BatToken42 contract using the MultiSigWallet", async function () {
      const { multiSigWallet, batToken, owner, addr1, recipient } = await deployFixture();
      const mintAmount = 50000;

      // 1. Initial State: Owner of Token is the Deployer
      expect(await batToken.owner()).to.equal(owner.address);

      // 2. Transfer Ownership of BatToken42 to the MultiSigWallet
      const walletAddress = await multiSigWallet.getAddress();
      await batToken.connect(owner).transferOwnership(walletAddress);
      expect(await batToken.owner()).to.equal(walletAddress);

      // 3. Original owner should no longer be able to mint directly
      await expect(
        batToken.connect(owner).mint(recipient.address, mintAmount)
      ).to.be.revertedWith("Not the owner");

      // 4. Encode the `mint` transaction payload
      const mintData = batToken.interface.encodeFunctionData("mint", [
        recipient.address,
        mintAmount
      ]);

      // 5. Submit the transaction through MultiSigWallet
      await multiSigWallet.connect(owner).submitTransaction(await batToken.getAddress(), 0, mintData);

      // 6. Provide required 2 confirmations
      await multiSigWallet.connect(owner).confirmTransaction(0);
      await multiSigWallet.connect(addr1).confirmTransaction(0);

      // 7. Execute the transaction from the wallet
      await expect(multiSigWallet.connect(owner).executeTransaction(0))
        .to.emit(multiSigWallet, "ExecuteTransaction")
        .withArgs(owner.address, 0);

      // 8. Verify the minting was successful!
      expect(await batToken.balanceOf(recipient.address)).to.equal(mintAmount);
      expect(await batToken.totalSupply()).to.equal(
        (await batToken.balanceOf(owner.address)) + BigInt(mintAmount)
      );
    });
  });
});