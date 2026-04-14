import { useState } from 'react';
// import { ethers } from 'ethers';
import { Form, Button, Alert } from 'react-bootstrap';

function WhitelistManager({ provider, crowdsale }) {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState(null);

  const handleAdd = async () => {
    try {
      const signer = provider.getSigner();
      const crowdsaleWithSigner = crowdsale.connect(signer);
      const tx = await crowdsaleWithSigner.addToWhitelist(address);
      await tx.wait();
      setStatus(`:white_check_mark: ${address} added to whitelist`);
      setAddress('');
    } catch (err) {
      setStatus(`:x: Error: ${err.message}`);
    }
  };

  const handleRemove = async () => {
    try {
      const signer = provider.getSigner();
      const crowdsaleWithSigner = crowdsale.connect(signer);
      const tx = await crowdsaleWithSigner.removeFromWhitelist(address);
      await tx.wait();
      setStatus(`:white_check_mark: ${address} removed from whitelist`);
      setAddress('');
    } catch (err) {
      setStatus(`:x: Error: ${err.message}`);
    }
  };

  return (
    <div className="my-4">
      <h5>Whitelist Manager (Owner Only)</h5>
      <Form.Control type="text" placeholder="0x address" value={address} onChange={(e) => setAddress(e.target.value)} className="mb-2" />
      <Button variant="success" onClick={handleAdd} className="me-2">
        Add to Whitelist
      </Button>
      <Button variant="danger" onClick={handleRemove}>
        Remove from Whitelist
      </Button>
      {status && <Alert className="mt-3">{status}</Alert>}
    </div>
  );
}

export default WhitelistManager;
