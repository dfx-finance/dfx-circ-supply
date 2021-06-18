require("dotenv").config();
import express from "express";
import { BigNumber, ethers, Contract } from "ethers";
import abi from "./abi.json";

const app = express();

const DFX = {
  address: "0x888888435fde8e7d4c54cab67f206e4199454c60",
  decimals: 18,
};

const EXCLUDE = [
  "0xa4fc358455febe425536fd1878be67ffdbdec59a", // sablier vesting funds
  "0x27e843260c71443b4cc8cb6bf226c3f77b9695af", // governance multisig
  "0x26f539a0fe189a7f228d7982bf10bc294fa9070c", // treasury multisig
];

// calculate excluded amounts, add them up, and subtract from total supply
const calcCircSupply = async (dfx: Contract): Promise<BigNumber> => {
  const exclusions: BigNumber[] = await Promise.all(
    EXCLUDE.map((addr) => dfx.balanceOf(addr)),
  );
  const totalExclusion = exclusions.reduce((acc, x) => acc.add(x));
  const totalSupply: BigNumber = await dfx.totalSupply();

  return totalSupply.sub(totalExclusion);
};

app.get("/", async (req, res) => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const dfx = new Contract(DFX.address, abi, provider);

  const rawCircSupply: BigNumber = await calcCircSupply(dfx);
  const circSupply = ethers.utils.formatUnits(rawCircSupply, DFX.decimals);

  res.status(200).type("text/plain").send(circSupply.toString());
});

app.listen(process.env.PORT || 80, async () => {
  console.log(
    `The application is listening on port ${process.env.PORT || 80}!`,
  );
});
