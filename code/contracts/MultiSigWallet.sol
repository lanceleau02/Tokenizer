// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MultiSigWallet
 * @dev A custom multi-signature wallet that mandates a threshold of confirmations 
 *      from authorized owners before executing transactions.
 */
contract MultiSigWallet {
    // ----------------------------------------------------
    // Events
    // ----------------------------------------------------
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);

    // ----------------------------------------------------
    // Structs
    // ----------------------------------------------------
    struct Transaction {
        address to;             // Recipient of the transaction (can be a user or a contract)
        uint256 value;          // Amount of native coins (e.g. Wei) to transfer
        bytes data;             // Transaction payload (e.g. encoded function call data)
        bool executed;          // Whether the transaction has been executed
        uint256 numConfirmations;// Number of times owners have confirmed this transaction
    }

    // ----------------------------------------------------
    // State Variables
    // ----------------------------------------------------
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public numConfirmationsRequired;

    Transaction[] public transactions;

    // Mapping from txIndex => owner => whether they confirmed
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    // ----------------------------------------------------
    // Modifiers
    // ----------------------------------------------------
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactions.length, "Transaction does not exist");
        _;
    }

    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "Transaction already executed");
        _;
    }

    modifier notConfirmed(uint256 _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "Transaction already confirmed by you");
        _;
    }

    // ----------------------------------------------------
    // Constructor & Fallbacks
    // ----------------------------------------------------
    /**
     * @notice Initializes the wallet with a list of owners and confirmation threshold.
     */
    constructor(address[] memory _owners, uint256 _numConfirmationsRequired) {
        require(_owners.length > 0, "Owners required");
        require(
            _numConfirmationsRequired > 0 && _numConfirmationsRequired <= _owners.length,
            "Invalid number of required confirmations"
        );

        for (uint256 i = 0; i < _owners.length; i++) {
            address ownerAddress = _owners[i];
            require(ownerAddress != address(0), "Invalid owner address");
            require(!isOwner[ownerAddress], "Owner address is not unique");

            isOwner[ownerAddress] = true;
            owners.push(ownerAddress);
        }

        numConfirmationsRequired = _numConfirmationsRequired;
    }

    /**
     * @dev Fallback function to receive funds.
     */
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    // ----------------------------------------------------
    // Core Functions (TODO)
    // ----------------------------------------------------

    /**
     * @notice Submits a transaction to be confirmed by other owners.
     * @param _to The address to interact with (user or contract).
     * @param _value The amount of native coin to send.
     * @param _data The payload data for contract calls.
     */
    function submitTransaction(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner {
        transactions.push(Transaction(_to, _value, _data, false, 0));
        emit SubmitTransaction(msg.sender, transactions.length - 1, _to, _value, _data);
    }

    /**
     * @notice Confirms a submitted transaction.
     * @param _txIndex The index of the transaction to confirm.
     */
    function confirmTransaction(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        isConfirmed[_txIndex][msg.sender] = true;
        transactions[_txIndex].numConfirmations++;
        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    /**
     * @notice Executes a fully-confirmed transaction.
     * @param _txIndex The index of the transaction to execute.
     */
    function executeTransaction(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        require(transactions[_txIndex].numConfirmations >= numConfirmationsRequired, "Not enough confirmations");
        transactions[_txIndex].executed = true;
        (bool success, ) = transactions[_txIndex].to.call{value: transactions[_txIndex].value}(transactions[_txIndex].data);
        require(success, "Transaction failed");
        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    /**
     * @notice Revokes a previously submitted confirmation.
     * @param _txIndex The index of the transaction to revoke confirmation for.
     */
    function revokeConfirmation(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        require(isConfirmed[_txIndex][msg.sender], "Transaction not confirmed by you");
        isConfirmed[_txIndex][msg.sender] = false;
        transactions[_txIndex].numConfirmations--;
        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    // ----------------------------------------------------
    // Getters
    // ----------------------------------------------------
    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }

    function getTransaction(uint256 _txIndex)
        public
        view
        txExists(_txIndex)
        returns (
            address to,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 numConfirmations
        )
    {
        Transaction storage transaction = transactions[_txIndex];
        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }
}
