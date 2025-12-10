// backend/SmartContractGenerator.js

const generateSmartContract = ({ artistAddress, platformAddress, percentages }) => {
  return `
    contract RoyaltySplit {
      address payable artist = payable(${artistAddress});
      address payable platform = payable(${platformAddress});

      function distribute() public payable {
        uint artistShare = msg.value * ${percentages.artist} / 100;
        uint platformShare = msg.value * ${percentages.platform} / 100;

        artist.transfer(artistShare);
        platform.transfer(platformShare);
      }
    }
  `;
};

export default generateSmartContract;
