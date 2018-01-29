(($iMap) => {
	'use strict';


	const regions = [
		{
			id: 'room',
			points: [
				[858, 7],
				[803, 176],
				[932, 176],
				[932, 7],
			],
			position: [875, 154],
		},
		{
			id: 'rails',
			points: [
				[0, 64],
				[0, 586],
				[64, 586],
				[64, 64],
			],
			position: [32, 202],
		},
		{
			id: 'zone1',
			points: [
				[96, 236],
				[96, 390],
				[425, 390],
				[425, 236],
			],
			position: [370, 276],
		},
		{
			id: 'zone2',
			points: [
				[468, 236],
				[468, 390],
				[693, 390],
				[693, 337],
				[797, 337],
				[797, 236],
			],
			position: [630, 364],
		},
		{
			id: 'zone3',
			points: [
				[96, 447],
				[96, 523],
				[195, 565],
				[374, 566],
				[405, 504],
				[405, 447],
			],
			position: [350, 480],
		},
		{
			id: 'stock',
			points: [
				[498, 460],
				[498, 579],
				[716, 579],
				[716, 460],
			],
			position: [670, 556],
		},
	];


	regions.forEach((region) => {
		const $item = $iMap.find(`#sb-${region.id}`);
		$item.css('left', region.position[0]);
		$item.css('top', region.position[1]);

		const $itemPointer = $('<div class="imap-sb-item-pointer"></div>');
		$itemPointer.css('left', region.position[0]);
		$itemPointer.css('top', region.position[1]);
		$itemPointer.appendTo($item);
	});


	let scale = 1;


	function updateScale() {
		$iMap.css('transform', 'scale(1)');

		const iMapRect = [$iMap.innerWidth(), $iMap.innerHeight()];
		const viewRect = [$(window).width(), $(window).height()];

		scale = Math.min(viewRect[0] / iMapRect[0], viewRect[1] / iMapRect[1]);
		$iMap.css('transform', `scale(${scale})`);
	}

	function getCursorInMap(cursor) {
		// Может перестать корректно работать при наличии прокрутки
		const { left, top, right, bottom } = $('.imap-bg')[0].getBoundingClientRect();


		// Проверяем, что мы находимся в пределах карты
		if (
			cursor[0] < left || cursor[0] > right ||
			cursor[1] < top || cursor[1] >= bottom
		) {
			return null;
		}

		return [
			(cursor[0] - left) / scale,
			(cursor[1] - top) / scale,
		];
	}

	function cursorInRegion(cursor, points) {
		function isUnder(point, cursor) {
			return point[1] < cursor[1];
		}

		function pointDiff(point, cursor) {
			return [point[0] - cursor[0], point[1] - cursor[1]]
		}

		let intCount = 0;

		for (let curr = 0, prev = points.length - 1; curr < points.length; curr++) {
			const currUnder = isUnder(points[curr], cursor);
			const prevUnder = isUnder(points[prev], cursor);

			const currDiff = pointDiff(points[curr], cursor);
			const prevDiff = pointDiff(points[prev], cursor);

			let t = prevDiff[0] * (currDiff[1] - prevDiff[1]) - prevDiff[1] * (currDiff[0] - prevDiff[0]);
			if (
				(currUnder && ! prevUnder) && t > 0 ||
				(! currUnder && prevUnder) && t < 0
			) {
				intCount++;
			}

			prev = curr;
		}

		return Boolean(intCount % 2);
	}


	$(window).on('resize', updateScale);
	updateScale();


	$(document).on('mousemove click', (event) => {
		const cursor = getCursorInMap([event.clientX, event.clientY]);

		const oldShown = regions.filter(region => region.isShown);

		regions.forEach((region) => {
			region.isShown = cursor && cursorInRegion(cursor, region.points);
		});

		const newShown = regions.filter(region => region.isShown);

		regions.forEach((region) => {
			if (oldShown.includes(region) && ! newShown.includes(region)) {
				$iMap.find(`#sb-${region.id}`).removeClass('imap-sb-item_active');
				$iMap.find(`#sb-${region.id}`).removeClass('imap-sb-item_click');
			}

			if (! oldShown.includes(region) && newShown.includes(region)) {
				$iMap.find(`#sb-${region.id}`).addClass('imap-sb-item_active');
			}

			if (newShown.includes(region) && event.type === 'click') {
				$iMap.find(`#sb-${region.id}`).addClass('imap-sb-item_click');
			}
		});
	});
})($('.imap'));
