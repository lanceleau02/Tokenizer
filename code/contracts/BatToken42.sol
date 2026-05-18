// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IERC20 / BEP-20 Interface
 * @dev BEP-20 is identical to ERC20 — implementing this interface
 *      guarantees full compliance with both standards.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title BatToken42
 * @dev BEP-20 compliant token deployed on BNB Chain.
 *      Manually implements the IERC20 interface.
 */
contract BatToken42 is IERC20 {
    //  Token metadata
    string public name     = "BatToken42";
    string public symbol   = "BT42";
    uint8  public decimals = 18;

    /// @dev Address of the contract owner (set at deployment)
    address public owner;

    /// @dev Total number of tokens in circulation
    uint256 private _totalSupply;

    /// @dev Balance of each address
    mapping(address => uint256) private _balances;

    /// @dev Allowances: _allowances[owner][spender] = amount
    mapping(address => mapping(address => uint256)) private _allowances;

    /// @dev Restricts access to the contract owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    /**
     * @dev Sets the deployer as owner and mints the initial supply to them.
     * @param initialSupply Amount of tokens to mint at deployment (without decimals)
     */
    constructor(uint256 initialSupply) {
        owner = msg.sender;
        _totalSupply = initialSupply * 10 ** decimals;
        _balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    /// @notice Returns the total token supply
    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    /// @notice Returns the token balance of a given address
    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    /**
     * @notice Transfers tokens from the caller to another address
     * @param to    Recipient address
     * @param value Amount to transfer
     */
    function transfer(address to, uint256 value) external override returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(_balances[msg.sender] >= value, "Balance is too low");

        _balances[msg.sender] -= value;
        _balances[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    /// @notice Returns how much `spender` is allowed to spend on behalf of `owner`
    function allowance(address _owner, address spender) external view override returns (uint256) {
        return _allowances[_owner][spender];
    }

    /**
     * @notice Approves `spender` to spend up to `value` tokens on the caller's behalf
     * @param spender Address authorized to spend
     * @param value   Maximum amount they can spend
     */
    function approve(address spender, uint256 value) external override returns (bool) {
        require(spender != address(0), "Approve to zero address");

        _allowances[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
     * @notice Transfers tokens on behalf of `from` using a prior approval
     * @param from  Address to transfer from
     * @param to    Address to transfer to
     * @param value Amount to transfer
     */
    function transferFrom(address from, address to, uint256 value) external override returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(_balances[from] >= value, "Balance is too low");
        require(_allowances[from][msg.sender] >= value, "Allowance is too low");

        _allowances[from][msg.sender] -= value;
        _balances[from] -= value;
        _balances[to] += value;
        emit Transfer(from, to, value);
        return true;
    }

    /**
     * @notice Transfers ownership of the contract to a new address.
     * @param newOwner Address of the new owner.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is zero address");
        owner = newOwner;
    }

    /**
     * @notice Mints new tokens to a given address — only the owner can call this
     * @param to    Address to receive the minted tokens
     * @param value Amount of tokens to mint
     */
    function mint(address to, uint256 value) external onlyOwner returns (bool) {
        require(to != address(0), "Mint to zero address");

        _balances[to] += value;
        _totalSupply += value;
        emit Transfer(address(0), to, value);
        return true;
    }

    /**
     * @notice Burns tokens from the caller's own balance
     * @param value Amount of tokens to burn
     */
    function burn(uint256 value) external returns (bool) {
        require(_balances[msg.sender] >= value, "Balance is too low");

        _balances[msg.sender] -= value;
        _totalSupply -= value;
        emit Transfer(msg.sender, address(0), value);
        return true;
    }
}