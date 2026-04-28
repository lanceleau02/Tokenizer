// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BatToken42 {
    // Name of the token
    string public name = "BatToken42";
    // Symbol of the token
    string public symbol = "BT42";
    // Number of decimals of the token
    uint8 public decimals = 18;
    // Total supply of the token
    uint256 public totalSupply = 1000000 * 10 ** decimals;

    // Mapping from address to balance (to keep a track of each address balance)
    mapping(address => uint256) public balanceOf;
    // Mapping from address to address to uint256 (to keep a track of each address allowance)
    mapping(address => mapping(address => uint256)) public allowance;

    // Event emitted when a token transfer occurs
    event Transfer(address indexed from, address indexed to, uint256 value);
    // Event emitted when an approval occurs
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // The constructor is a function that is called only once when the contract is deployed.
    // It is used to initialize the state variables of the contract.
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }

    // The transfer function is used to transfer tokens from one address to another.
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Balance is too low");
        require(balanceOf[_to] + _value >= balanceOf[_to], "Overflow");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // The approve function is used to approve an address to spend tokens on behalf of the caller.
    function approve (address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // The transferFrom function is used to transfer tokens from one address to another on behalf of the caller.
    function transferFrom (address _from, address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[_from] >= _value, "Balance is too low");
        require(balanceOf[_to] + _value >= balanceOf[_to], "Overflow");
        require(allowance[_from][msg.sender] >= _value, "Allowance is too low");
        allowance[_from][msg.sender] -= _value;
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function mint(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[_to] + _value >= balanceOf[_to], "Overflow");
        balanceOf[_to] += _value;
        emit Transfer(address(0), _to, _value);
        totalSupply += _value;
        return true;
    }

    function burn(address _from, uint256 _value) public returns (bool success) {
        require(balanceOf[_from] >= _value, "Balance is too low");
        balanceOf[_from] -= _value;
        emit Transfer(_from, address(0), _value);
        totalSupply -= _value;
        return true;
    }
}
