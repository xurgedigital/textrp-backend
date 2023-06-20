# TextRP Unified Messaging - XRPL Control Layer

This repository contains the Control Layer for TextRP's modified Synapse server that allows for integration with the XRP Ledger (XRPL) to enable features and channels depending on NFT holdings of the users, and payment processing for messaging credit bundles in XRP and other XRPL tokens.

The control layer is responsible for managing user accounts, messaging credit balances, and NFT holdings. It interfaces with the XRPL and the chat client to process payments detect NFT holdings, and manage user identity.

**Basic System Diagram**
![system_diagram](https://iili.io/HhoOcVs.md.png)

## Technical Design

TextRP instantiates a Synapse homeserver (https://github.com/xurgedigital/textrp-synapse) modified to interface with this XRPL-enabled control layer to enable the following features:

- Custom channels and themes based on NFT holdings: Users can customize their chat interface by holding specific NFTs. For example, holding a Slack and Twitter NFTs can enable those channels in the UI. This gives users complete control of their experience.

- Sends SMS messages to any mobile phone (US/Canada numbers only for now) via Twilio interface.
![SMS Messaging](https://iili.io/HhoezXe.png)

- Payment processing for messaging credit bundles: Users can purchase messaging credit bundles using XRP and other XRPL tokens. The control layer interfaces with the XRPL to process payments and update the user's messaging credit balance.

The Synapse server is modified to include the following components:

- XRPL Interface: The XRPL interface is responsible for interfacing with the XRPL to enable payment processing and NFT detection.

- When a user sends a message to an XRP address, the system first checks if the address belongs to an active user, and routes the message to the user if found. If the XRP address has no account, the system stores the message, sends microtransaction via XRPL with Message Notification in memo field (and whether the sender is kyc-verified via XUMM). When receiver logs in the system onboards the account seamlessly and the receiver can read/respond to the message, where now the conversation is in-app (free) and off the XRPL to prevent needlessly burdening the XRPL.

**XRPL Message Relay**
![XRPL Messaging](https://iili.io/Hhoe6Yl.md.png)

## Capabilities for the Production Version:
- APIs to additional private messaging channels (Twitter, Discord, LinkedIn, Slack, etc.) to unify all users' favorite private chat methods under one UI.
- NFTs will serve a KEY role here, as users will be empowered to customize their chat interface by holding specific NFTs. For example, hold a Slack and Twitter NFTs to enable those channels in the UI. This gives users complete control of their experience.

## Usage

Once the TextRP server is running, users can connect to the server using the TextRP client and start messaging. Users can purchase messaging credit bundles using XRP and other XRPL tokens by sending payments to the XRPL address specified in the `homeserver.yaml` file. The control layer will detect the payment and update the user's messaging credit balance accordingly.

Users can also customize their chat interface by holding specific NFTs. The control layer will detect the user's NFT holdings and enable the corresponding channels and themes in the UI.

## Conclusion
TextRP enables a range of features and capabilities that enhance the messaging experience for users. By leveraging the XRP Ledger, we can offer fast and secure payment processing and privacy in account management. The integration of NFTs allows for a more personalized and customizable experience, giving users complete control over their messaging environment.

We believe that this modified Synapse server has the potential to revolutionize the messaging industry by offering a unique and innovative approach to messaging.

Thank you for your interest in TextRP. If you have any questions or feedback, please feel free to contact us at **nft (at-) textrp. io**
