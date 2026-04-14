import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers';
// Components
import Info from './Info';
import Navigation from './Navigation';
import Buy from './Buy';
import Loading from './Loading';
import Progress from './Progress';
import WhitelistManager from './Whitelist Manager';

//ABIs
import TOKEN_ABI from '../abis/Token.json';
import CROWDSALE_ABI from '../abis/Crowdsale.json';

//config
import config from '../config.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [crowdsale, setCrowdsale] = useState(null);
  const [isOpen, setIsOpen] = useState(null);
  const [minContribution, setMinContribution] = useState(null);
  const [maxContribution, setMaxContribution] = useState(null);

  const [account, setAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(0);

  const [price, setPrice] = useState(0);
  const [maxTokens, setMaxTokens] = useState(0);
  const [tokensSold, setTokensSold] = useState(0);
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData();
    }
  }, [isLoading]);

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    //fetch ChainID
    const { chainId } = await provider.getNetwork();

    //Initiate contracts

    const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider);
    const crowdsale = new ethers.Contract(config[chainId].crowdsale.address, CROWDSALE_ABI, provider);
    setCrowdsale(crowdsale);
    setIsOpen(await crowdsale.isOpen());
    setMinContribution(await crowdsale.minContribution());
    setMaxContribution(await crowdsale.maxContribution());

    console.log(await crowdsale.openingTime());

    // Fetch accounts

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const owner = await crowdsale.owner();
    setOwner(owner);

    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);

    //Fetch account balance
    const accountBalance = ethers.utils.formatUnits(await token.balanceOf(account));
    setAccountBalance(accountBalance);
    //Fetch price
    const price = ethers.utils.formatUnits(await crowdsale.price(), 18);
    setPrice(price);

    //Fetch max tokens
    const maxTokens = ethers.utils.formatUnits(await crowdsale.maxTokens(), 18);
    setMaxTokens(maxTokens);

    const tokensSold = ethers.utils.formatUnits(await crowdsale.tokensSold(), 18);
    setTokensSold(tokensSold);

    setIsLoading(false);
  };

  console.log('isOpen', isOpen);

  return (
    <Container>
      <Navigation />

      <h1 className="my-4 text-center">Introducing Dapp Token!</h1>
      <p className="text-center">
        <strong>ICO Status:</strong> {isOpen ? 'Open' : 'Closed'}
      </p>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <p className="text-center">
            <strong>Current Price:</strong> {price} ETH
          </p>
          {account && account.toLowerCase() === owner?.toLowerCase() && <WhitelistManager provider={provider} crowdsale={crowdsale} />}
          {isOpen && (
            <Buy provider={provider} price={price} crowdsale={crowdsale} setIsLoading={setIsLoading} minContribution={minContribution} maxContribution={maxContribution} />
          )}
          <Progress maxTokens={maxTokens} tokensSold={tokensSold} />
        </>
      )}

      <hr />
      {account && <Info account={account} accountBalance={accountBalance} />}
    </Container>
  );
}

export default App;
