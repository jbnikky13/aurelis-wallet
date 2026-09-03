export type SwapQuote={tokenIn:string;tokenOut:string;amountIn:string;amountOut:string;priceImpact?:string;route?:string[];expiresAt:number};

export function isFreshQuote(quote:SwapQuote){return Date.now()<quote.expiresAt;}
export function validateSlippage(slippage:number){if(!Number.isFinite(slippage)||slippage<0||slippage>50)throw new Error('Slippage must be between 0% and 50%.');return slippage;}
