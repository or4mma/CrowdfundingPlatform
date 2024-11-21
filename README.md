# Crowdfunding Platform

This project implements a comprehensive crowdfunding platform using Clarity smart contracts and the Clarinet development framework. The platform includes the following components:

1. Campaign Creation and Management
2. Milestone-based Fund Release
3. Backer Rewards Distribution

## Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet)
- [Node.js](https://nodejs.org/)

## Setup

1. Clone the repository:

git clone [https://github.com/yourusername/crowdfunding-platform.git](https://github.com/yourusername/crowdfunding-platform.git)
cd crowdfunding-platform

```plaintext

2. Install dependencies:
```

npm install

```plaintext

3. Run tests:
```

clarinet test

```plaintext

## Contracts

### Campaign Manager

The `campaign-manager` contract handles campaign operations:
- Create new campaigns
- Back campaigns with STX
- End campaigns
- Retrieve campaign information

### Milestone Tracker

The `milestone-tracker` contract manages campaign milestones:
- Add milestones to campaigns
- Complete milestones
- Retrieve milestone information

### Reward Distributor

The `reward-distributor` contract handles backer rewards:
- Add rewards to campaigns
- Assign rewards to backers
- Claim rewards
- Check reward status

## Testing

Each contract has its own test file in the `tests` directory. You can run all tests using the `clarinet test` command.

## Usage

1. Create a campaign using the `create-campaign` function in the `campaign-manager` contract.
2. Add milestones to the campaign using the `add-milestone` function in the `milestone-tracker` contract.
3. Add rewards for backers using the `add-reward` function in the `reward-distributor` contract.
4. Backers can support the campaign using the `back-campaign` function in the `campaign-manager` contract.
5. Assign rewards to backers based on their contributions using the `assign-reward` function in the `reward-distributor` contract.
6. Update milestone status as the campaign progresses using the `complete-milestone` function in the `milestone-tracker` contract.
7. Backers can claim their rewards using the `claim-reward` function in the `reward-distributor` contract.
8. End the campaign when it's finished using the `end-campaign` function in the `campaign-manager` contract.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
```
