import { useContext } from "react";
import {
  useViewerConnection,
  EthereumAuthProvider
} from "@self.id/framework";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { ethers } from "ethers";
import { BlockifyContext } from "../../context";
import { contractAddress, tokenAddress } from "../../consts";
import BlockifyContract from "../../abi/Blockify.json";
import BlockifyTokenContract from "../../abi/BlockifyToken.json";

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

export const ConnectButton = () => {
  const [connection, connect, disconnect] = useViewerConnection();
  const {
    setUserAddress,
    setBlockifyContract,
    setBlockifyTokenContract,
    setBlogDid,
  } = useContext(BlockifyContext);

  const connectWallet = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    /* @ts-ignore */
    setUserAddress(accounts[0]);
    /* @ts-ignore */
    await connect(new EthereumAuthProvider(window.ethereum, accounts[0])).then(
      (data) => data?.id && setBlogDid(data?.id)
    );
    /* @ts-ignore */
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      contractAddress,
      BlockifyContract.abi,
      signer
    );
    setBlockifyContract(contract);
    const tokenContract = new ethers.Contract(
      tokenAddress,
      BlockifyTokenContract.abi,
      signer
    );
    setBlockifyTokenContract(tokenContract);
  };

  return connection.status === "connected" ? (
    <button onClick={disconnect}>Disconnect ({connection.selfID.id})</button>
  ) : "ethereum" in window ? (
    <button
      disabled={connection.status === "connecting"}
      onClick={connectWallet}
    >
      Connect
    </button>
  ) : (
    <p>
      An injected Ethereum provider such as{" "}
      <a href="https://metamask.io/">MetaMask</a> is needed to authenticate.
    </p>
  );
};
