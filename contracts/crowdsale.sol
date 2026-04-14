// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import './token.sol';

contract Crowdsale {
    address public owner;
    Token public token;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;
    mapping(address => bool) public whitelist;
    uint256 public openingTime;
    uint256 public closingTime;
    uint256 public minContribution;
    uint256 public maxContribution;

    event Buy(uint256 amount, address buyer);
    event Finalize(uint256 tokensSold, uint256 ethRaised);

    constructor(Token _token, uint256 _price, uint256 _maxTokens, uint256 _openingTime, uint256 _closingTime, uint256 _minContribution, uint256 _maxContribution) {
        owner = msg.sender;
        token = _token;
        price = _price;
        maxTokens = _maxTokens;
        openingTime = _openingTime;
        closingTime = _closingTime;
        minContribution = _minContribution;
        maxContribution = _maxContribution;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, 'caller is not the owner');
        _;
    }
    modifier onlyWhitelisted() {
        require(whitelist[msg.sender], 'Not whitelisted');
        _;
    }

    receive() external payable {
        uint256 amount = msg.value / price;
        buyTokens(amount * 1e18);
    }

    function isOpen() public view returns (bool) {
        return block.timestamp >= openingTime && block.timestamp <= closingTime;
    }

    function addToWhitelist(address _address) public onlyOwner {
        console.log(_address);
        whitelist[_address] = true;
    }

    function removeFromWhitelist(address _address) public onlyOwner {
        whitelist[_address] = false;
    }

    function buyTokens(uint256 _amount) public payable onlyWhitelisted {
        require(msg.value == (_amount / 1e18) * price);
        require(token.balanceOf(address(this)) >= _amount);
        require(token.transfer(msg.sender, _amount));
        require(block.timestamp >= openingTime, 'Crowdsale not open yet');
        require(_amount >= minContribution, 'Below minimum contribution');
        require(_amount <= maxContribution, 'Above maximum contribution');

        tokensSold += _amount;

        emit Buy(_amount, msg.sender);
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    function finalize() public onlyOwner {
        require(token.transfer(owner, token.balanceOf(address(this))));

        uint256 value = address(this).balance;
        (bool sent, ) = owner.call{value: value}('');
        require(sent);

        emit Finalize(tokensSold, value);
    }
}
