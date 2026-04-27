// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Token42 {
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

    // Event emitted when a token transfer occurs
    event Transfer(address indexed from, address indexed to, uint256 value);

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
}
