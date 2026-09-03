export type AssetQuote = { chainId:number; symbol:string; balance:string; priceUsd:number; valueUsd:number };

export function portfolioTotal(quotes: AssetQuote[]) { return quotes.reduce((sum,item)=>sum+item.valueUsd,0); }

export function formatUsd(value:number) { return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value); }
