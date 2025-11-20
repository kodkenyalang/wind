# Wind - DeFi Price Tracking and Reward Distribution dApp

## Overview
Wind is a DeFi application that automatically tracks SOL and BTC price movements and distributes SOL token rewards to authenticated users when specific price increase conditions are met.

## Authentication
- Users authenticate using Internet Identity
- Only authenticated users are eligible for reward distributions

## Price Tracking and Reward Logic
- Backend continuously monitors SOL and BTC prices using live oracle API (CoinGecko or Binance)
- Automatic reward distribution triggers when:
  - SOL price increases by 30% from previous benchmark, OR
  - BTC price increases by 10% from previous benchmark
- When conditions are met, distribute 0.5 SOL tokens to all authenticated users' wallet addresses
- Backend executes automatic transactions for reward distribution

## Backend Data Storage
- User wallet addresses linked to Internet Identity
- Price benchmarks for SOL and BTC
- Reward distribution history (recipient, amount, trigger condition, timestamp)
- Current price data cache

## Frontend Dashboard Features
- Live price display for SOL and BTC with auto-refresh
- Price change percentages from previous benchmarks
- Reward events log showing:
  - Recipient addresses
  - Reward amounts
  - Trigger conditions (SOL 30% or BTC 10% increase)
  - Distribution timestamps
- Wallet connection interface
- Real-time notifications when rewards are triggered
- User's personal reward history

## Core Functionality
- Periodic price data fetching from external APIs
- Automatic condition checking and reward triggering
- Wallet integration for receiving SOL tokens
- Real-time price updates on frontend
- Notification system for reward events
