import { useState } from 'react';
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenAddress, setTokenAddress] = useState('');
  const [recipients, setRecipients] = useState('');
  const [amounts, setAmounts] = useState('');
  const [status, setStatus] = useState('');

  const connectWallet = async () => {
    const web3Modal = new Web3Modal({
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            rpc: {
              3912: 'https://testnet.pharosnetwork.xyz',
            },
            chainId: 3912,
          },
        },
      },
    });
    const instance = await web3Modal.connect();
    const prov = new ethers.providers.Web3Provider(instance);
    const signer = prov.getSigner();
    setProvider(prov);
    setSigner(signer);
    setStatus('Wallet connected');
  };

  const sendTokens = async () => {
    const tokenABI = [
      'function transfer(address to, uint amount) returns (bool)',
    ];
    const contract = new ethers.Contract(tokenAddress, tokenABI, signer);

    const recipientList = recipients.split('\n').map((addr) => addr.trim());
    const amountList = amounts
      .split('\n')
      .map((a) => ethers.utils.parseUnits(a.trim(), 18));

    if (recipientList.length !== amountList.length) {
      setStatus('Recipient and amount counts do not match');
      return;
    }

    setStatus('Sending...');

    for (let i = 0; i < recipientList.length; i++) {
      try {
        const tx = await contract.transfer(recipientList[i], amountList[i]);
        await tx.wait();
      } catch (err) {
        console.error(`Failed to send to ${recipientList[i]}`, err);
      }
    }

    setStatus('All tokens sent! ✅');
  };

  return (
    <main style={{ padding: 40 }}>
      <h2>Pharos Multi-Sender</h2>
      <button onClick={connectWallet}>Connect Wallet (WalletConnect)</button>
      <br /><br />
      <input
        placeholder="ERC20 Token Address"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
        style={{ width: 300 }}
      />
      <br /><br />
      <textarea
        placeholder="Recipient addresses, one per line"
        value={recipients}
        onChange={(e) => setRecipients(e.target.value)}
        rows={6}
        cols={40}
      />
      <br /><br />
      <textarea
        placeholder="Amounts (same order), one per line"
        value={amounts}
        onChange={(e) => setAmounts(e.target.value)}
        rows={6}
        cols={40}
      />
      <br /><br />
      <button onClick={sendTokens}>Send Tokens</button>
      <p>{status}</p>
    </main>
  );
}
