'use strict';

const path = require('path');
const fs = require('fs');
const numbro = require('numbro');
const snx = require('synthetix');

const network = 'mainnet';
const synths = snx.getSynths({ network });

const doRounding = (entry, limit) => {
	const num = entry * 2 - limit;

	const decimals = (limit.toString().split('.')[1] || '').length;

	return Number(num).toFixed(decimals);
};

const desc = synth => {
	const underlying = (synth.description || synth.desc).replace(/^Inverted /, '');
	const assetSuffix = synth.name !== underlying ? ` (${synth.asset})` : '';
	if (synth.name === 'sUSD') {
		return 'Tracks the price of a single US Dollar (USD). This Synth always remains constant at 1.';
	} else if (synth.inverted) {
		// Note: indexes can be inverted - so we have this check earlier to show inverted info for inverted indexes
		const { entryPoint, upperLimit, lowerLimit } = synth.inverted;
		return (
			`Inversely tracks the price of ${underlying}${assetSuffix} through price feeds supplied by an oracle. ` +
			`The entry point is \\$${entryPoint} (the approximate market price at time of creation). ` +
			`This Synth freezes when it reaches its upper limit of \\$${upperLimit} (i.e. when ${underlying}'s ` +
			`value reaches \\$${doRounding(
				entryPoint,
				upperLimit,
			)}) or its lower limit of \\$${lowerLimit} (i.e. when ${underlying}’s value ` +
			`reaches \\$${doRounding(
				entryPoint,
				lowerLimit,
			)}). If it reaches either of its limits and gets frozen, it will no longer be ` +
			'able to be purchased on Synthetix.Exchange, but can still be traded for other Synths at its frozen ' +
			`value. At some point after it has reached either of its limits, it will be substituted for another ${synth.name} with different limits.`
		);
	} else if (synth.index) {
		return (
			`Tracks the price of the index: ${underlying}${assetSuffix} through price feeds supplied by an oracle. ` +
			'This index is made up of the following assets and weights: ' +
			synth.index
				.map(({ symbol, description: name, units }) => `${units} of ${symbol}${name !== symbol ? ` (${name})` : ''}`)
				.join(', ') +
			'.'
		);
	} else {
		return `Tracks the price of ${underlying}${assetSuffix} through price feeds supplied by an oracle.`;
	}
};

console.log('Building tokens.md');

const tokens = snx.getTokens({ network }).map(entry => {
	const synth = synths.find(s => s.name === entry.symbol);
	const description =
		entry.symbol === 'SNX'
			? 'The Synthetix Network Token (SNX) gets staked as collateral to back Synths and entitles stakers to receive fees generated by Synth trades on Synthetix.Exchange.'
			: desc(synth);
	return Object.assign({ name: entry.desc, description }, entry);
});

// Note: required until https://github.com/Synthetixio/synthetix/commit/43b2ee69834fbd39ad4683acd746311313d67961 is published to synthetix on npm
const feeds = snx.getFeeds({ network });

const format = num =>
	numbro(num).format({
		optionalMantissa: true,
		mantissa: 5,
		thousandSeparated: true,
	});

const getLinkToAsset = ({ name, asset }) => (name.split(' ').slice(1).join('-') + '-s' + asset).toLowerCase();

const addInverseParameters = ({ inverted, asset, name }) => {
	if (!inverted) return '';

	return (
		`**Inverse of**: [s${asset}](#${getLinkToAsset({ name, asset })})\n\n` +
		'| Entry Point | Upper Limit | Lower Limit |\n' +
		'| - | - | - |\n' +
		`| $${format(inverted.entryPoint)} | $${format(inverted.upperLimit)} | $${format(inverted.lowerLimit)}|\n\n`
	);
};

const addIndexParameters = ({ index, inverted, asset, name }) => {
	if (!index) return '';
	const header = `**Index of**: [s${asset}](#${getLinkToAsset({
		name,
		asset,
	})})\n\n`;
	if (inverted) {
		// don't show index parameters here if also inverted, the link to the long asset will suffice
		return header;
	}
	return (
		header +
		'| Token | Symbol | Units | Initial Weight |\n| - | - | - |\n' +
		index
			.sort((a, b) => {
				if (a.weight === b.weight) return a.asset > b.asset ? 1 : -1;
				return a.weight > b.weight ? -1 : 1;
			})
			.map(
				({ description: name, asset, units, weight }) =>
					`| ${name || asset} | ${asset} | ${format(units)} | ${weight}% |\n`,
			)
			.join('') +
		'\n'
	);
};

const addOracleParameters = ({ symbol, asset, feed }) => {
	if (!feed && symbol === 'SNX') {
		feed = feeds['SNX'].feed;
		asset = symbol; // can remove after https://github.com/Synthetixio/synthetix/commit/8479d5fae70c09fb9a8b35525797e12cd60731c2
	} else if (!feed) {
		return '';
	}
	const linkMap = { FTSE100: 'ftse-gbp', NIKKEI225: 'n225-jpy', DEFI: 'sdefi-usd', CEX: 'scex-usd' };
	const symbolLink = linkMap[asset] || `${asset.toLowerCase()}-usd`;
	return (
		`**Price Feed**: Chainlink (decentralized)\n\n- Oracles: [Network overview](https://feeds.chain.link/${symbolLink})` +
		`\n- Contract: [Aggregator](https://etherscan.io/address/${feed})\n\n`
	);
};

const content = `
# Token List

${tokens
	.sort((a, b) => (a.name > b.name ? 1 : -1))
	.map(
		({ name, asset, symbol, address, decimals, description, index, inverted, feed }) =>
			`## ${name} (${symbol})\n\n` +
			`**Contract:** [${address}](https://etherscan.io/token/${address})\n\n` +
			`**Decimals:** ${decimals}\n\n` +
			(symbol !== 'SNX'
				? `**Price:** [${symbol} on synthetix.exchange](https://synthetix.exchange/#/synths/${symbol})\n\n`
				: '') +
			addOracleParameters({ name, asset, symbol, feed }) +
			addInverseParameters({ name, asset, inverted }) +
			addIndexParameters({ name, asset, index, inverted }) +
			`>${description}`,
	)
	.join('\n\n')}

`;
fs.writeFileSync(path.join(__dirname, '..', 'content', 'tokens', 'list.md'), content);
