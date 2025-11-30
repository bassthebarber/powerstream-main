// backend/tvDistribution/contracts/distributorLicense.js
export function generateDistributorLicense({ companyName, distributionType }) {
return {
title: `Content Distribution License Agreement: ${companyName}`,
type: distributionType,
agreement: `By using PowerStream distribution services, ${companyName} agrees to pay the defined licensing fee, royalties and acknowledge AI-enhancement usage terms.`,
licenseIssued: new Date().toISOString(),
};
}