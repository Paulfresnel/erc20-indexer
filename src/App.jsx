import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Divider
} from '@chakra-ui/react'

import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { ProgressBar } from 'react-loader-spinner';


function App() {
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [emptyRequestError, setEmptyRequestError] = useState("")

  const account = useAccount({
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected', { address, connector, isReconnected })
      setUserAddress(address)
    }
  })  

  async function getTokenBalance() {
    if (userAddress === "" || userAddress.length < 42){
      setEmptyRequestError("Please input a valid wallet address");
      setTimeout(()=>{
        setEmptyRequestError("")
      },1500)
      return;
    }
    setIsLoading(true);
    const config = {
      apiKey: import.meta.env.VITE_API_KEY,
      network: Network.ETH_MAINNET,
    };

    

    const alchemy = new Alchemy(config);
    const data = await alchemy.core.getTokenBalances(userAddress);
    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = alchemy.core.getTokenMetadata(
        data.tokenBalances[i].contractAddress
      );
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setTimeout(()=>{
      setIsLoading(false);
      setDataLoaded(true);
    },1000 )
  }
  return (
    <Box w="100vw">
    <div className="connect-wallet" >
    <ConnectButton onClick={(e)=>setWalletAddress(e)}/>
    </div>
    <Divider className="divider" orientation='horizontal' colorScheme="teal" size="md" />
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        <Heading className="heading-main" mt={42}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        <Input
          placeholder="input any address or connect with yours"
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          value={userAddress}
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />
        <Button className="main-button" fontSize={20} onClick={getTokenBalance} mt={36} bgColor="#ffc82d">
          Check ERC-20 Token Balances
        </Button>
        {emptyRequestError !== "" && <div className='error'>{emptyRequestError}</div>}

        {dataLoaded && <Heading className="no-margin" my={36}>ERC-20 token balances:</Heading>}
    {isLoading && (<div className='flex-col'><p>Loading...</p><ProgressBar
  height="80"
  width="80"
  ariaLabel="progress-bar-loading"
  wrapperStyle={{}}
  wrapperClass="progress-bar-wrapper"
  borderColor = '#FF5964'
  barColor = '#35A7FF'
/></div>)}
        {dataLoaded && 
                <TableContainer>
                  <Table variant="striped" colorScheme="green" size="lg">
                  <Thead>
                    <Tr>
                      <Th>Token</Th>
                      <Th>Ticker</Th>
                      <Th>Balance</Th>
                      <Th>address</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {results.tokenBalances.map((token, index)=>{
                      return(
                        <Tr key={token.contractAddress}>
                          <Td>{tokenDataObjects[index].name}</Td>
                          <Td className="flex-row">{tokenDataObjects[index].logo && <img className='token-logo' src={tokenDataObjects[index].logo}></img>} {" "} {tokenDataObjects[index].symbol}</Td>
                          <Td>{parseInt(token.tokenBalance/(10**tokenDataObjects[index].decimals))}</Td>
                          <Td className="link"><a href={`https://etherscan.io/token/${token.contractAddress}`}>{token.contractAddress.slice(0,5)+"..."+token.contractAddress.slice(35,42)}</a></Td>
                        </Tr>
                      )
                    })}
                  </Tbody>
                  </Table>
                </TableContainer>
                
                
              
            }
          
        
      </Flex>
    </Box>
  );
}

export default App;
