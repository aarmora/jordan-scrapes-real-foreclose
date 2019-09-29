import puppeteer, { Page } from 'puppeteer';
import { getPropertyBySelector } from 'puppeteer-helpers';
import * as json2csv from 'json2csv';
import * as fs from 'fs';

const regionalDomain = 'miamidade';

(async () => {

	const url = `https://www.${regionalDomain}.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR`;

	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await page.goto(url);
	const auctions: any[] = [];

	const nextMonthDate = getDateWithFollowingMonth();

	await handleMonth(page, auctions);

	await page.goto(`https://www.${regionalDomain}.realforeclose.com/index.cfm?zaction=user&zmethod=calendar&selCalDate=${nextMonthDate}`);

	// Let's do it for the following month as well
	await handleMonth(page, auctions);

	console.log('Total auctions', auctions.length);

	await browser.close();

	const csv = json2csv.parse(auctions);

	fs.writeFile('auctions.csv', csv, async (err) => {
		if (err) {
			console.log('err while saving file', err);
		}
	});

})();

async function handleMonth(page: Page, auctions: any[]) {


	await page.waitForSelector('.CALDAYBOX');

	const dayids = await page.$$eval('.CALSELF', elements => elements.map(element => element.getAttribute('dayid')));

	const baseDayPage = `https://www.${regionalDomain}.realforeclose.com/index.cfm?zaction=AUCTION&Zmethod=PREVIEW&AUCTIONDATE=`;

	for (let dayid of dayids) {
		// check if dayid is greater than today
		if (new Date(dayid) > new Date()) {
			await Promise.all([page.goto(`${baseDayPage}${dayid}`), page.waitForNavigation({ waitUntil: 'networkidle2' })]);
			await handleAuction(page, auctions);

			console.log('Finished checking day:', dayid, 'Total auctions now:', auctions.length);
		}
	}


}

async function handleAuction(page: Page, auctions: any[]) {
	// Handle closed auctions
	const maxPagesForClosedAuctions = parseInt(await getPropertyBySelector(page, '#maxCA', 'innerHTML'));
	for (let i = 1; i < maxPagesForClosedAuctions; i++) {
		await handleAuctions(page, auctions);

		const pageRight = await page.$('.Head_C .PageRight:nth-of-type(3)');

		await Promise.all([pageRight.click(), await page.waitFor(750)]);
	}

	// Handle waiting auctions
	const maxPagesForWaitingAuctions = parseInt(await getPropertyBySelector(page, '#maxWA', 'innerHTML'));
	for (let i = 1; i < maxPagesForWaitingAuctions; i++) {
		await handleAuctions(page, auctions);

		const pageRight = await page.$('.Head_W .PageRight:nth-of-type(3)');

		await Promise.all([pageRight.click(), await page.waitFor(750)]);
	}

}

async function handleAuctions(page: Page, auctions: any[]) {
	const auctionsHandle = await page.$$('.AUCTION_ITEM');
	for (let auctionHandle of auctionsHandle) {
		let status;
		try {
			status = await getPropertyBySelector(auctionHandle, '.ASTAT_MSGB.Astat_DATA', 'innerHTML');
		}
		catch (e) {
			console.log('error getting status', e);
		}
		const auction: any = {
			status: status
		};
		const auctionRows = await auctionHandle.$$('table tr');
		for (let row of auctionRows) {
			let label = await getPropertyBySelector(row, 'th', 'innerHTML');
			label = label.trim().replace(' ', '');

			if (label === 'ParcelID:') {
				auction[label] = await getPropertyBySelector(row, 'td a', 'innerHTML');
				auction['ParcelLink'] = await getPropertyBySelector(row, 'a', 'href');
			}
			else if (label !== '') {
				label = label.trim().replace(' ', '');
				auction[label] = await getPropertyBySelector(row, 'td', 'innerHTML');
			}
			else {
				auction['address2'] = await getPropertyBySelector(row, 'td', 'innerHTML');
			}
		}


		auctions.push(auction);

	}
}


function getDateWithFollowingMonth() {
	const now = new Date();
	if (now.getMonth() == 11) {
		return formatDate(new Date(now.getFullYear() + 1, 0, 1));
	} else {
		return formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 1));
	}
}

function formatDate(date) {
	let d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2)
		month = '0' + month;
	if (day.length < 2)
		day = '0' + day;

	return [year, month, day].join('-');
}