import {stringify, copy} from './utils.js';

function removePreSlash (urlParamsStr) {
	if (urlParamsStr[0] === '/') {
		return urlParamsStr.substr(1);
	}
	return urlParamsStr;
}

function stringifyUrlParams (urlParams) {
	if (!urlParams || !urlParams.length) {
		return '';
	}

	if (typeof urlParams === 'string') {
		urlParams = removePreSlash(urlParams);
		return `/${urlParams}`;
	}

	const params = urlParams.filter((param) => (param && typeof param === 'string'));

	if (!params.length) {
		return '';
	}

	return `/${params.join('/')}`;
}

function addCacheBreaker (cacheBreaker, qryStrObj) {
	if (cacheBreaker) {
		qryStrObj[cacheBreaker] = Date.now();
	}
}

function prepareQryStr (baseQryStrObj, dynaQryStrObj, cacheBreaker) {
	const qryStrObj = copy(baseQryStrObj, dynaQryStrObj);

	addCacheBreaker(cacheBreaker, qryStrObj);

	const queryString = stringify(qryStrObj);

	return queryString ? ('?' + queryString) : '';
}

function normalizeBaseUrl (baseUrl) {
	if (baseUrl === '/') {
		return '';
	}

	const len = baseUrl.length;

	if (baseUrl[len-1] === '/') {
		return baseUrl.substr(0, len-1);
	}

	return baseUrl;
}

export default function (servant, params, qryStr) {
	const baseUrl = normalizeBaseUrl(servant.baseUrl);

	params = stringifyUrlParams(params);
	qryStr = prepareQryStr(servant.baseQryStr, qryStr, servant.cacheBreaker);

	return baseUrl + params + qryStr;
}