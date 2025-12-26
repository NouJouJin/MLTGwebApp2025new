import { ThirdwebProvider, walletConnect, useActiveAccount, useActiveWallet, useChainId, useSDK, useSigner } from "@thirdweb-dev/react";
import { ConnectWallet } from "@thirdweb-dev/react"; // ConnectWallet コンポーネントもインポート
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";

import "./App.css";
import { useEffect, useState } from "react";

import logo from "./images/logo.png";

import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/esm/Container";
import Navbar from "react-bootstrap/esm/Navbar";
import Nav from "react-bootstrap/esm/Nav";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Tab from "react-bootstrap/esm/Tab";
import Tabs from "react-bootstrap/esm/Tabs";
import Button from "react-bootstrap/esm/Button";
import Table from "react-bootstrap/esm/Table";
import Modal from "react-bootstrap/esm/Modal";
import Form from "react-bootstrap/esm/Form";
import Stack from "react-bootstrap/esm/Stack";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import Alert from "react-bootstrap/esm/Alert";
import Spinner from "react-bootstrap/esm/Spinner";

const chainIdList = [
  { id: 1, name: "eth", hex: "0x1" },
  { id: 5, name: "goerli", hex: "0x5" },
  { id: 137, name: "polygon", hex: "0x89" },
  { id: 80001, name: "mumbai", hex: "0x13881" },
  { id: 84532, name: "Base Sepolia", hex: "0x14980" }, // 84532 in hex is 0x14980
  { id: 8453, name: "Base", hex: "0x2105" }, // 8453 in hex is 0x2105
];

// 入力値検証関数
const validateForm = (formData) => {
  const errors = {};

  // 名前の検証
  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = "名前は2文字以上で入力してください";
  }

  // 郵便番号の検証（日本の形式）
  const zipRegex = /^\d{3}-\d{4}$/;
  if (!zipRegex.test(formData.zipCode)) {
    errors.zipCode = "郵便番号は「123-4567」の形式で入力してください";
  }

  // メールアドレスの検証
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    errors.email = "有効なメールアドレスを入力してください";
  }

  // 電話番号の検証（日本の形式）
  const telRegex = /^0\d{1,4}-\d{1,4}-\d{4}$/;
  if (!telRegex.test(formData.tel)) {
    errors.tel = "電話番号は「000-0000-0000」の形式で入力してください";
  }

  return errors;
};

// エラー通知コンポーネント
const ErrorNotification = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <Alert variant="danger" dismissible onClose={onClose}>
      <Alert.Heading>エラーが発生しました</Alert.Heading>
      <p>{error}</p>
    </Alert>
  );
};

// Polygon自動切り替え機能
const switchToPolygon = async () => {
  try {
    // MetaMaskがインストールされているか確認
    if (typeof window.ethereum === 'undefined') {
      alert('ウォレットが検出されませんでした。MetaMaskをインストールするか、WalletConnectで接続してください。');
      return;
    }

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }], // Polygon Mainnet
    });
  } catch (error) {
    // チェーンが追加されていない場合
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x89',
            chainName: 'Polygon Mainnet',
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18
            },
            rpcUrls: ['https://polygon-rpc.com/'],
            blockExplorerUrls: ['https://polygonscan.com/']
          }],
        });
      } catch (addError) {
        console.error(addError);
        alert('Polygonネットワークの追加に失敗しました。');
      }
    } else if (error.code === 4001) {
      // ユーザーがキャンセルした場合
      console.log('ネットワーク切り替えがキャンセルされました');
    } else {
      console.error(error);
      alert('ネットワークの切り替えに失敗しました。');
    }
  }
};

const getAccount = async () => {
  try {
    // MetaMaskがインストールされているか確認
    if (typeof window.ethereum === 'undefined') {
      throw new Error('ウォレットが検出されませんでした。MetaMaskをインストールするか、「WalletConnectで接続」ボタンをご利用ください。');
    }

    const account = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (account.length > 0) {
      return account[0];
    } else {
      return "";
    }
  } catch (err) {
    if (err.code === 4001) {
      // ユーザーが接続をキャンセルした場合
      console.log("ウォレット接続がキャンセルされました");
    } else {
      console.error(err);
    }
    throw err; // エラーを再スローして上位で処理できるようにする
  }
};

// const handleAccountChanged = async (accountNo, setAccount, setChainId, setNfts, setCollections, setChainName) => {
//   const account = await getAccount();
//   setAccount(account); //walletID

//   const chainId = await getChainID();
//   setChainId(chainId); //メタマスクで設定されているチェーン

//   const chainName = await getChainName(chainId);
//   setChainName(chainName);

//   console.log(process.env.WEB3_API_KEY); //thirdwebのAPIキー
//   const web3ApiKey = process.env.REACT_APP_MORALIS_API_KEY;
//   const options = {
//     method: "GET",
//     headers: {
//       accept: "application/json",
//       "X-API-Key": web3ApiKey,
//     },
//   };

//   // 条件追加
//   const contractAddress = "0x4EB966346341834940a815e1841BF5A6549532F8"; // 取得したいコントラクトアドレス
//   const resNftData = await fetch(`https://deep-index.moralis.io/api/v2.2/${account}/nft?chain=${chainName}`, options); //v2.2に更新
//   const resNft = await resNftData.json();
//   console.log(JSON.stringify(resNft));

//   let nfts = [];
//   for (let nft of resNft.result) {
//     const tmp = JSON.parse(nft.metadata);
//     console.log(JSON.stringify(tmp));
//     if (tmp !== null) {
//       const optionTokenInfo = {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE_API_KEY}`,
//         },
//       };
//       const resTokenInfo = await fetch(
//         //airTableのNFTのaddressとIDを取得している
//         `https://api.airtable.com/v0/appq0R9tJ2BkvKhRt/tblGeRuC0iRypjYfl?filterByFormula=AND(%7BContract_ID%7D%3D%22${nft.token_address}%22%2C%7BToken_ID%7D%3D${nft.token_id})`,
//         optionTokenInfo
//       );
//       const resTokenInfoJson = await resTokenInfo.json();
//       if (resTokenInfoJson.records[0] !== undefined) {
//         console.log(JSON.stringify(resTokenInfoJson.records[0]));
//         const nftinfo = {
//           contract_name: nft.name,
//           image: tmp.image !== "" ? `https://ipfs.io/ipfs/${tmp.image.substring(7)}` : "",
//           nft_name: tmp.name,
//           present_detail: resTokenInfoJson.records[0].fields.Thanks_Gift,
//           token_address: nft.token_address,
//           token_id: nft.token_id,
//           amount: nft.amount,
//           key_id: resTokenInfoJson.records[0].fields.Key_ID,
//         };
//         nfts.push(nftinfo);
//       }
//     }
//   }

//   //発行日でソート
//   setNfts(
//     nfts.sort((a, b) => {
//       var r = 0;
//       if (a.issue_date > b.issue_date) {
//         r = -1;
//       } else if (a.issue_date < b.issue_date) {
//         r = 1;
//       }
//       return r;
//     })
//   );
// };

// タイムアウト付きのfetch関数（共通）
const fetchWithTimeout = (url, options, timeout = 30000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

// WalletConnect接続時のNFT取得関数（window.ethereumに依存しない）
const fetchNFTsForWalletConnect = async (accountAddress, chainName, setNfts, setLoading = null, setError = null) => {
  try {
    if (setLoading) setLoading(true);
    if (setError) setError(null);

    // APIプロキシ経由でNFTデータを取得（APIキーはサーバーサイドで管理）
    const resNftData = await fetchWithTimeout(
      `/api/moralis-nfts?address=${accountAddress}&chain=${chainName}`,
      { method: "GET" }
    );

    if (!resNftData.ok) {
      throw new Error(`API Error: ${resNftData.status}`);
    }

    const resNft = await resNftData.json();

    let nfts = [];

    const nftPromises = resNft.result.map(async (nft) => {
      try {
        const tmp = JSON.parse(nft.metadata);
        if (tmp !== null) {
          // APIプロキシ経由でAirtableからNFT情報を取得
          const resTokenInfo = await fetchWithTimeout(
            `/api/airtable-nft-info?tokenAddress=${nft.token_address}&tokenId=${nft.token_id}`,
            { method: "GET" }
          );

          if (!resTokenInfo.ok) {
            return null;
          }

          const resTokenInfoJson = await resTokenInfo.json();

          if (resTokenInfoJson.records[0] !== undefined) {
            return {
              contract_name: nft.name,
              image: tmp.image !== "" ? `https://ipfs.io/ipfs/${tmp.image.substring(7)}` : "",
              nft_name: tmp.name,
              present_detail: resTokenInfoJson.records[0].fields.Thanks_Gift,
              token_address: nft.token_address,
              token_id: nft.token_id,
              amount: nft.amount,
              key_id: resTokenInfoJson.records[0].fields.Key_ID,
            };
          }
        }
      } catch (error) {
        return null;
      }
      return null;
    });

    const nftResults = await Promise.all(nftPromises);
    nfts = nftResults.filter(nft => nft !== null);

    setNfts(
      nfts.sort((a, b) => {
        var r = 0;
        if (a.issue_date > b.issue_date) {
          r = -1;
        } else if (a.issue_date < b.issue_date) {
          r = 1;
        }
        return r;
      })
    );

  } catch (error) {
    console.error("Error in fetchNFTsForWalletConnect:", error);
    if (setError) {
      if (error.message && error.message.includes('Request timeout')) {
        setError('通信がタイムアウトしました。ネットワーク接続を確認してから再度お試しください。');
      } else if (error.message && error.message.includes('API Error')) {
        setError('NFT情報の取得に失敗しました。しばらく待ってから再度お試しください。');
      } else {
        setError(error.message || '予期しないエラーが発生しました');
      }
    }
  } finally {
    if (setLoading) setLoading(false);
  }
};

// 6/1 読み込み速度改善
const handleAccountChanged = async (accountNo, setAccount, setChainId, setNfts, setCollections, setChainName, setLoading = null, setError = null) => {
  try {
    // ローディング状態開始
    if (setLoading) setLoading(true);
    if (setError) setError(null);

    const account = await getAccount();
    setAccount(account);

    const chainId = await getChainID();
    setChainId(chainId);

    const chainName = await getChainName(chainId);
    setChainName(chainName);

    // APIプロキシ経由でNFTデータを取得（APIキーはサーバーサイドで管理）
    const resNftData = await fetchWithTimeout(
      `/api/moralis-nfts?address=${account}&chain=${chainName}`,
      { method: "GET" }
    );

    if (!resNftData.ok) {
      throw new Error(`API Error: ${resNftData.status}`);
    }

    const resNft = await resNftData.json();

    let nfts = [];

    // NFTデータの並列処理でさらなる高速化
    const nftPromises = resNft.result.map(async (nft) => {
      try {
        const tmp = JSON.parse(nft.metadata);
        if (tmp !== null) {
          // APIプロキシ経由でAirtableからNFT情報を取得
          const resTokenInfo = await fetchWithTimeout(
            `/api/airtable-nft-info?tokenAddress=${nft.token_address}&tokenId=${nft.token_id}`,
            { method: "GET" }
          );

          if (!resTokenInfo.ok) {
            return null;
          }

          const resTokenInfoJson = await resTokenInfo.json();

          if (resTokenInfoJson.records[0] !== undefined) {
            return {
              contract_name: nft.name,
              image: tmp.image !== "" ? `https://ipfs.io/ipfs/${tmp.image.substring(7)}` : "",
              nft_name: tmp.name,
              present_detail: resTokenInfoJson.records[0].fields.Thanks_Gift,
              token_address: nft.token_address,
              token_id: nft.token_id,
              amount: nft.amount,
              key_id: resTokenInfoJson.records[0].fields.Key_ID,
            };
          }
        }
      } catch (error) {
        return null;
      }
      return null;
    });

    // 並列処理の結果を待機
    const nftResults = await Promise.all(nftPromises);
    nfts = nftResults.filter(nft => nft !== null);

    // 発行日でソート
    setNfts(
      nfts.sort((a, b) => {
        var r = 0;
        if (a.issue_date > b.issue_date) {
          r = -1;
        } else if (a.issue_date < b.issue_date) {
          r = 1;
        }
        return r;
      })
    );

  } catch (error) {
    console.error("Error in handleAccountChanged:", error);

    // ユーザーフレンドリーなエラーメッセージを設定
    if (setError) {
      if (error.message && error.message.includes('MetaMaskがインストールされていません')) {
        setError('ウォレットが検出されませんでした。MetaMaskをインストールするか、「WalletConnectで接続」ボタンからスマートフォンのウォレットアプリで接続してください。');
      } else if (error.message && error.message.includes('Request timeout')) {
        setError('通信がタイムアウトしました。ネットワーク接続を確認してから再度お試しください。');
      } else if (error.message && error.message.includes('API Error')) {
        setError('NFT情報の取得に失敗しました。しばらく待ってから再度お試しください。');
      } else if (error.message && error.message.includes("Cannot read properties of undefined")) {
        setError('ウォレットに接続できませんでした。「WalletConnectで接続」ボタンからスマートフォンのウォレットアプリで接続してください。');
      } else if (error.code === 4001) {
        // ユーザーがキャンセルした場合は何も表示しない
        setError(null);
      } else {
        setError('ウォレット接続中にエラーが発生しました。ページを再読み込みして再度お試しください。');
      }
    }
  } finally {
    // ローディング状態終了
    if (setLoading) setLoading(false);
  }
};

const getChainName = async (chainId) => {
  let data = chainIdList.filter(function (item) {
    return item.id === chainId;
  });

  return data[0].name;
};

const getChainID = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('ウォレットが検出されませんでした。MetaMaskをインストールするか、「WalletConnectで接続」ボタンをご利用ください。');
  }
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  return parseInt(chainId);
};

//walletのNFTコレクションを取得する
const handleCollectonSelect = async (chainName, setSelectedCollection, setSelectedCollectionName, setMintedNfts) => {
  let selectedCollection = "";
  let elements = document.getElementsByName("collections");
  for (let i in elements) {
    if (elements.item(i).checked) {
      selectedCollection = elements.item(i).id;
      setSelectedCollection(selectedCollection);
      setSelectedCollectionName(elements.item(i).value);
    }
  }

  // APIプロキシ経由でコレクションNFTを取得
  const resNftData = await fetch(`/api/collection-nfts?collection=${selectedCollection}&chain=${chainName}`);
  const resNft = await resNftData.json();
  let nfts = [];
  for (let nft of resNft.result) {
    const tmp = JSON.parse(nft.metadata);
    if (tmp !== null) {
      if ("attributes" in tmp) {
        let issue_date = "";
        let issuer_name = "";
        let owner_address = "";
        let genre = "";
        for (const attribute of tmp.attributes) {
          if (attribute.trait_type === "exp_type") {
            genre = attribute.value;
          } else if (attribute.trait_type === "ca_name" || attribute.trait_type === "issuer_name") {
            issuer_name = attribute.value;
          } else if (attribute.trait_type === "owner_address") {
            owner_address = attribute.value;
          } else if (attribute.trait_type === "cert_date" || attribute.trait_type === "issue_date") {
            issue_date = attribute.value.substring(0, 4) + "/" + attribute.value.substring(4, 6) + "/" + attribute.value.substring(6);
          }
        }

        const nftinfo = {
          name: tmp.name,
          image: tmp.image !== "" ? `https://ipfs.io/ipfs/${tmp.image.substring(7)}` : "",
          issue_date: issue_date,
          issuer_name: issuer_name,
          owner_address: owner_address,
          genre: genre,
          description: tmp.description,
          token_address: nft.token_address,
        };

        nfts.push(nftinfo);
      }
    }
  }
  setMintedNfts(
    nfts.sort((a, b) => {
      var r = 0;
      if (a.issue_date > b.issue_date) {
        r = -1;
      } else if (a.issue_date < b.issue_date) {
        r = 1;
      }

      return r;
    })
  );
};

const handleNewContract = async (account, chainName, setDisable, setCollections, setShowNewToken) => {
  setDisable(true);

  let cn = chainName;
  if (chainName === "eth") {
    cn = "mainnet";
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const sdk = ThirdwebSDK.fromSigner(signer, cn);

  const contractAddress = await sdk.deployer.deployNFTCollection({
    name: document.getElementById("token_name").value,
    symbol: document.getElementById("token_symbol").value,
    primary_sale_recipient: account,
  });

  const metadata = {
    name: "First NFT",
    description: "First NFT to show in Q list.",
    image: "",
  };

  const contract = await sdk.getContract(contractAddress);
  await contract.erc721.mint(metadata);

  setDisable(false);
  setShowNewToken(false);

  document.getElementById("reloadContract").click();
};

// ミントした場合の機能（現在未使用 - 必要な場合は環境変数を設定して有効化）
// const handleMint = async (selectedCollection, chainName, setDisable, setMintedNfts, setShow) => {
//   // この機能を使用する場合は、別途APIエンドポイントを作成してください
// };

const handleLogout = async () => {
  window.location.href = "/";
};

const handleSubmit = async (account, nft, chainName, size, otherSize, handleClose, setIsSubmitting, setFormErrors, setError, setSize, setOtherSize, setNfts, nfts, signer = null) => {
  // フォームデータの取得
  const name = document.getElementById("Name").value;
  const zipCode = document.getElementById("Zip_Code").value;
  const address = document.getElementById("Address").value;
  const tel = document.getElementById("Tel").value;
  const mail = document.getElementById("Mail").value;

  // Notes フィールドが存在する場合のみ取得（Tシャツフォームには存在しない）
  const notesElement = document.getElementById("Notes");
  const Notes = notesElement ? notesElement.value : "";

  // バリデーション実行
  const formData = {
    name: name,
    zipCode: zipCode,
    email: mail,
    tel: tel,
  };

  const errors = validateForm(formData);

  // エラーがある場合は処理を中断
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    setError("入力内容にエラーがあります。修正してください。");
    return;
  }

  // エラーをクリア
  setFormErrors({});
  setError(null);

  // 確認ダイアログのメッセージ
  let confirmMessage = `
  以下の情報で送信してもよろしいですか？

  名前: ${name}
  郵便番号: ${zipCode}
  住所: ${address}
  電話番号: ${tel}
  メール: ${mail}\n`;
  if (size) confirmMessage += `  サイズ: ${size}\n`;
  if (otherSize) confirmMessage += `  その他サイズ: ${otherSize}\n`;

  // 確認ダイアログを表示
  if (!window.confirm(confirmMessage)) {
    // ユーザーがキャンセルを選択した場合、処理を中断
    handleClose();
    setIsSubmitting(false); // 送信状態を解除
    return;
  }

  setIsSubmitting(true); // 送信状態を開始

  try {
    let cn = chainName;
    if (chainName === "eth") {
      cn = "mainnet";
    }

    // Signerの取得（MetaMaskとWalletConnectの両方に対応）
    let txSigner;
    if (signer) {
      // WalletConnect接続時（useSignerフックから渡される）
      txSigner = signer;
    } else if (window.ethereum) {
      // MetaMask接続時
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      txSigner = await provider.getSigner();
    } else {
      throw new Error("ウォレットが接続されていません。MetaMaskまたはWalletConnectで接続してください。");
    }

    const sdk = ThirdwebSDK.fromSigner(txSigner, cn);
    const contract = await sdk.getContract(nft.token_address);

    const walletAddress = "0x6D8Dd5Cf6fa8DB2be08845b1380e886BFAb03E07";
    const amount = 1;
    const tokenId = nft.token_id;

    // NFT転送の実行
    await contract.erc1155.transfer(walletAddress, tokenId, amount);

    // APIプロキシ経由でAirtableへ注文データを送信
    const submitBody = {
      records: [
        {
          fields: {
            Key_ID: nft.key_id,
            Thanks_Gift: nft.present_detail,
            Name: name,
            Zip_Code: zipCode,
            Address: address,
            Tel: tel,
            Mail: mail,
            Notes: Notes,
            Size: size,
            Size_Other: otherSize,
          },
        },
      ],
    };

    const resTokenInfo = await fetch(`/api/airtable-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitBody),
    });

    // 成功時の処理
    // 転送したNFTをリストから削除
    const updatedNfts = nfts.filter(item =>
      !(item.token_address === nft.token_address && item.token_id === nft.token_id)
    );
    setNfts(updatedNfts);

    alert(`${nft.nft_name}の交換完了しました。到着するまでお楽しみに！`);

    // フォームをリセット
    document.getElementById("Name").value = "";
    document.getElementById("Zip_Code").value = "";
    document.getElementById("Address").value = "";
    document.getElementById("Tel").value = "";
    document.getElementById("Mail").value = "";

    // Notesフィールドのリセット（存在する場合のみ）
    const notesField = document.getElementById("Notes");
    if (notesField) {
      notesField.value = "";
    }

    // Reactのstateをリセット
    setSize("");
    setOtherSize("");

    // ラジオボタンのリセット
    document.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.checked = false;
    });

    setIsSubmitting(false); // 送信状態を解除
    handleClose(); // モーダルを閉じる

  } catch (error) {
    console.error("Transfer error:", error);

    // より詳細なエラーハンドリング
    if (error.code === 4001) {
      setError("トランザクションがキャンセルされました");
    } else if (error.code === -32603) {
      setError("NFTの転送に失敗しました。ガス代が不足している可能性があります");
    } else if (error.message && error.message.includes("insufficient funds")) {
      setError("ガス代が不足しています。ウォレットに十分なMATICがあることを確認してください");
    } else if (error.message && (error.message.includes("missing revert data") || error.message.includes("Transaction reverted"))) {
      setError("NFTの転送に失敗しました。このNFTを所有していないか、既に引き換え済みの可能性があります。ページを再読み込みしてご確認ください。");
    } else if (error.message && error.message.includes("TRANSACTION ERROR")) {
      setError("NFTの転送に失敗しました。このNFTを所有していないか、既に引き換え済みの可能性があります。ページを再読み込みしてご確認ください。");
    } else {
      setError("NFTの転送中にエラーが発生しました。しばらく待ってから再度お試しください。");
    }

    setIsSubmitting(false); // 送信状態を解除
  }
};

function App() {
  // ThirdWebのフックを使用してウォレット情報を取得
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  const connectedChainId = useChainId();
  const signer = useSigner();

  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(0);
  const [chainName, setChainName] = useState("");
  // const [index, setIndex] = useState(0);
  const [disable, setDisable] = useState(false);
  const [show, setShow] = useState(false);
  const [showNewToken, setShowNewToken] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [selectedNft, setSelectedNft] = useState({});
  const [collections, setCollections] = useState([]);
  const [mintedNfts, setMintedNfts] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedCollectionName, setSelectedCollectionName] = useState("");
  const [selectedGiftNft, setSelectedGiftNft] = useState("");
  const location = window.location.pathname.toLowerCase();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ローディング、エラー、フォームバリデーションの状態管理
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const handleClose = () => {
    size = ""; // サイズをリセット
    otherSize = ""; // その他のサイズをリセット
    setShow(false);
    setIsSubmitting(false); // 送信状態を解除
  };
  const handleShow = () => setShow(true);
  const handleCloseNewToken = () => setShowNewToken(false);
  const handleShowNewToken = () => setShowNewToken(true);
  const handleCloseDetail = () => setShowDetail(false);
  const handleShowDetail = async (nft) => {
    setSelectedNft(nft);
    // ダイアログの内容をリセット
    setSize("");
    setOtherSize("");
    // 他のダイアログ関連の状態もリセット
    setShowDetail(true);
  };

  const [size, setSize] = useState(""); // デフォルトのサイズを設定
  const [otherSize, setOtherSize] = useState(""); // 「その他」のサイズを設定
  const handleRadioChange = (event) => {
    setSize(event.target.value);
    if (event.target.value !== "その他") {
      setOtherSize(""); // 「その他」以外が選択されたら、テキストフィールドをクリア
    }
  };

  const handleOtherSizeChange = (event) => {
    setOtherSize(event.target.value);
  };

  const specificKeys = ["rec65kFu48ut5GPhC", "recB1VbiT6bR7TMnH", "recqCurt5f435BcVf", "recj2JF2UnJU2ixXw", "reclz4Dg5QS8VnJZ0", "recyBnzU9IzYtJuCT", "recK0sK8Hzq6ffghW", "recs6Mdq8UFgEjpPD", "recjmIXtdNbAdMQnd", "rec5noihUnn4JYDeV", "recCafjYmJ2gX9K0l", "reclxuPXKWLkCjmVE", "recbf3QmOkvjog5FM"]; //オリジナルTシャツのNFTのkey
  // const handleSelect = (selectedIndex, e) => {
  //   setIndex(selectedIndex);
  // };

  const initializeAccount = async () => {
    // MetaMaskがインストールされていない場合は何もしない（WalletConnect経由での接続を推奨）
    if (typeof window.ethereum === 'undefined') {
      console.log('MetaMaskが検出されませんでした。WalletConnectで接続してください。');
      return;
    }

    try {
      const account = await getAccount();
      if (account !== "") {
        await handleAccountChanged(account, setAccount, setChainId, setNfts, setCollections, setChainName, setLoading, setError);
      }
    } catch (err) {
      // ユーザーフレンドリーなエラーメッセージを表示
      if (err.code === 4001) {
        // ユーザーがキャンセルした場合は何も表示しない
        console.log('ウォレット接続がキャンセルされました');
      } else {
        setError('ウォレットへの接続に失敗しました。ページを再読み込みするか、WalletConnectで接続してください。');
      }
    }
  };

  // WalletConnect接続時の処理（ThirdWebフック使用）
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (activeAccount && activeAccount.address) {
        // WalletConnectまたはThirdWeb経由でウォレットが接続されている場合
        setAccount(activeAccount.address);

        if (connectedChainId) {
          setChainId(connectedChainId);
          const chainName = await getChainName(connectedChainId);
          setChainName(chainName);

          // NFT情報を取得（WalletConnect接続時）
          await fetchNFTsForWalletConnect(activeAccount.address, chainName, setNfts, setLoading, setError);
        }
      }
    };

    handleWalletConnection();
  }, [activeAccount, connectedChainId]);

  // MetaMask接続時の処理（従来の方法）
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      // MetaMaskがある場合のみイベントリスナーを設定
      const handleAccountsChanged = async (accountNo) => {
        try {
          await handleAccountChanged(accountNo, setAccount, setChainId, setNfts, setCollections, setChainName, setLoading, setError);
        } catch (err) {
          console.error('アカウント変更時のエラー:', err);
          setError('ウォレット情報の取得に失敗しました。ページを再読み込みしてください。');
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleAccountsChanged);

      // クリーンアップ関数
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleAccountsChanged);
        }
      };
    }
    // MetaMaskがない場合は何もしない（WalletConnectで接続を推奨）
  }, [account]);

  return (
    // 追加
    <ThirdwebProvider
    activeChain="polygon" // または "polygon" や "base" など、使いたいチェーン
    clientId={process.env.REACT_APP_THIRDWEB_CLIENT_ID}
    supportedWallets={[walletConnect()]}
  >
    <div className="App d-flex flex-column">
      <div className="mb-auto w-100">
        <>
          <Navbar>
          <Container>
                <Navbar.Brand href="#home">
                  <img src={logo} width="250" />
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                  <Navbar.Text>
                    {/* MetaMask 接続ボタン (MetaMask がインストールされている場合のみ表示) */}
                    {typeof window.ethereum !== 'undefined' && (
                      <Button className="py-2 px-4 btn-lg me-2" variant="outline-dark" id="GetAccountButton" onClick={initializeAccount}>
                        MetaMaskに接続
                      </Button>
                    )}
                    {/* WalletConnect 接続ボタン */}
                    <ConnectWallet btnTitle="WalletConnectで接続" />
                  </Navbar.Text>
                </Navbar.Collapse>
              </Container>
            </Navbar>
          <Container className="my-1 p-1">
            <Navbar expand="lg">
              <Container className="mx-0 px-0">
                <Nav>
                  <Stack className="left-align">
                    <div>
                      <h3>
                        保有NFT一覧
                        <Button id="reloadNft" className="mb-1" variant="text" onClick={() => handleAccountChanged(account, setAccount, setChainId, setNfts, setCollections, setChainName, setLoading, setError)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                          </svg>
                        </Button>
                      </h3>
                    </div>
                    <div>
                      <p>
                        <small>このウォレットにある「MetagriLabo Thanks Gift（MLTG）」の一覧です。</small>
                      </p>
                    </div>
                  </Stack>
                </Nav>
              </Container>
            </Navbar>

            {/* エラー通知 */}
            <ErrorNotification error={error} onClose={() => setError(null)} />

            {/* NFT読み込み中の表示 */}
            {loading && (
              <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">読み込み中...</span>
                </Spinner>
              </div>
            )}

            {/* NFTが0件の場合 */}
            {!loading && !error && nfts.length === 0 && account && (
              <Alert variant="info">
                <p>MLTGが見つかりませんでした。</p>
                <p>
                  <small className="text-danger">
                    <strong>
                      ※ウォレットがPolygonネットワークに設定されているか、ご確認お願いします。
                      <a href="https://youtu.be/d4wUJLyQSuU" target="_blank" rel="noopener noreferrer">
                        （確認動画はこちら）
                      </a>
                    </strong>
                  </small>
                </p>
                <Button onClick={switchToPolygon} variant="primary">
                  Polygonネットワークに切り替える
                </Button>
              </Alert>
            )}

            <Table className="table-hover" responsive={true}>
              <thead className="table-secondary">
                <tr>
                  <th>画像</th>
                  {/* <th>ID</th> */}
                  <th>コントラクト</th>
                  <th>NFT名</th>
                  <th>もらえるもの</th>
                  <th>数量</th>
                  <th>引き換え</th>
                </tr>
              </thead>
              <tbody>
                {nfts.length !== 0 ? (
                  nfts.map((nft, index) => {
                    return (
                      <tr key={index} className="align-middle">
                        <td>
                          {nft.image !== "" ? (
                            <a href={nft.image} target="_blank" rel="noreferrer">
                              <img src={nft.image} alt="nftimage" width="70px" />
                            </a>
                          ) : (
                            <></>
                          )}
                        </td>
                        {/* <td>{nft.token_id}</td> */}
                        {/* <td>{nft.key_id}</td> */}
                        <td>{nft.contract_name}</td>
                        <td>{nft.nft_name}</td>
                        <td>{nft.present_detail}</td>
                        <td>{nft.amount}</td>
                        <td>
                          <input class="form-check-input" type="radio" name="flexRadioDefault" id={index} onClick={() => handleShowDetail(nft)} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <></>
                )}
              </tbody>
            </Table>
            {/* 選択したNFTによって変わる */}
            {/* オリジナルTシャツ	*/}
            {selectedNft && specificKeys.includes(selectedNft.key_id) && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>お名前</Form.Label>
                  <Form.Control
                    id="Name"
                    type="text"
                    isInvalid={!!formErrors.name}
                  />
                  {formErrors.name && (
                    <Form.Text className="text-danger">{formErrors.name}</Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>郵便番号</Form.Label>
                  <Form.Control
                    id="Zip_Code"
                    type="text"
                    placeholder="000-0000"
                    isInvalid={!!formErrors.zipCode}
                  />
                  {formErrors.zipCode && (
                    <Form.Text className="text-danger">{formErrors.zipCode}</Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>ご住所</Form.Label>
                  <Form.Control id="Address" type="text" placeholder="都道府県市町村番地建物" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>電話番号</Form.Label>
                  <Form.Control
                    id="Tel"
                    type="text"
                    placeholder="000-0000-0000"
                    isInvalid={!!formErrors.tel}
                  />
                  {formErrors.tel && (
                    <Form.Text className="text-danger">{formErrors.tel}</Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>通知先メールアドレス</Form.Label>
                  <Form.Control
                    id="Mail"
                    type="email"
                    placeholder="experience@metagri-labo.com"
                    isInvalid={!!formErrors.email}
                  />
                  {formErrors.email && (
                    <Form.Text className="text-danger">{formErrors.email}</Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>サイズ</Form.Label>
                </Form.Group>
                <Form.Group className="mb-3">
                  <div className="d-inline-block me-2">
                    <Form.Check type="radio" label="S" name="size" value="S" id="S-size" onChange={handleRadioChange} />
                  </div>

                  <div className="d-inline-block me-2">
                    <Form.Check type="radio" label="M" name="size" value="M" id="M-size" onChange={handleRadioChange} />
                  </div>

                  <div className="d-inline-block me-2">
                    <Form.Check type="radio" label="L" name="size" value="L" id="L-size" onChange={handleRadioChange} />
                  </div>
                  <div className="d-inline-block me-2">
                    <Form.Check type="radio" label="XL" name="size" value="XL" id="XL-size" onChange={handleRadioChange} />
                  </div>
                  <div className="d-inline-block me-2">
                    <Form.Check type="radio" label="その他" name="size" value="その他" id="other" onChange={handleRadioChange} />
                  </div>
                </Form.Group>

                {/* その他が選択された場合のテキストフィールド */}
                {size === "その他" && (
                  <Form.Group className="mb-3">
                    <Form.Label>その他サイズ</Form.Label>
                    <Form.Control type="text" id="Other-size" value={otherSize} onChange={handleOtherSizeChange} />
                  </Form.Group>
                )}

                {/* 備考フィールドの追加 */}
                <Form.Group className="mb-3">
                  <Form.Label>備考</Form.Label>
                  <Form.Control id="Notes" type="text" placeholder="贈答用の場合や その他特記事項" rows={3} />
                </Form.Group>
              </Form>
            )}
            {/* デフォルト */}
            {selectedNft && !specificKeys.includes(selectedNft.key_id) && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>お名前</Form.Label>
                  <Form.Control
                    id="Name"
                    type="text"
                    isInvalid={!!formErrors.name}
                  />
                  {formErrors.name && (
                    <Form.Text className="text-danger">{formErrors.name}</Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>郵便番号</Form.Label>
                  <Form.Control
                    id="Zip_Code"
                    type="text"
                    placeholder="000-0000"
                    isInvalid={!!formErrors.zipCode}
                  />
                  {formErrors.zipCode && (
                    <Form.Text className="text-danger">{formErrors.zipCode}</Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>ご住所</Form.Label>
                  <Form.Control id="Address" type="text" placeholder="都道府県市町村番地建物" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>電話番号</Form.Label>
                  <Form.Control
                    id="Tel"
                    type="text"
                    placeholder="000-0000-0000"
                    isInvalid={!!formErrors.tel}
                  />
                  {formErrors.tel && (
                    <Form.Text className="text-danger">{formErrors.tel}</Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>通知先メールアドレス</Form.Label>
                  <Form.Control
                    id="Mail"
                    type="email"
                    placeholder="experience@metagri-labo.com"
                    isInvalid={!!formErrors.email}
                  />
                  {formErrors.email && (
                    <Form.Text className="text-danger">{formErrors.email}</Form.Text>
                  )}
                </Form.Group>
                {/* ここから自由記入欄の追加 */}
                <Form.Group className="mb-3">
                  <Form.Label>備考</Form.Label>
                  <Form.Control id="Notes" type="text" placeholder="贈答用の場合や その他特記事項" rows={3} />
                </Form.Group>
                {/* 自由記入欄の追加ここまで */}
              </Form>
            )}
            {/* </Form> */}
            {disable === false ? (
              <>
                {/* <Button className="px-4" variant="outline-dark" onClick={handleClose}>
                  キャンセル
                </Button> */}
                <Button className="px-4" variant="outline-dark" disabled={isSubmitting} onClick={() => handleSubmit(account, selectedNft, chainName, size, otherSize, handleClose, setIsSubmitting, setFormErrors, setError, setSize, setOtherSize, setNfts, nfts, signer)}>
                  申し込む
                </Button>
              </>
            ) : (
              <>
                {/* <Button className="px-4" variant="outline-dark" disabled={true}>
                  キャンセル
                </Button> */}
                <Button className="px-4" variant="dark" disabled={isSubmitting}>
                  {isSubmitting && <span className="me-2 spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                  {isSubmitting ? "数分かかる場合があります..." : "申し込む"}
                </Button>
              </>
            )}
          </Container>
        </>
        </div>
        <footer className="mt-auto p-3">Ideated by Studymeter Inc.</footer>
      </div>
    </ThirdwebProvider>
  );
}

export default App;
