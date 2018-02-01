(($iMap, regions) => {
	'use strict';


	regions.forEach((region) => {
		const $fl = $iMap.find('#fl');

		const $flItem = $(`
			<svg id="fl-${region.id}" class="imap-fl-item" xmlns="http://www.w3.org/2000/svg">
				<polygon fill="${region.color}" points="${region.points.map(point => point.join(',')).join(' ')}"/>
			</svg>
		`);
		$flItem.appendTo($fl);


		const $sb = $iMap.find('#sb');

		const $sbItem = $(`<div id="sb-${region.id}" class="imap-sb-item"></div>`);
		$sbItem.css('left', region.position[0]);
		$sbItem.css('top', region.position[1]);
		$sbItem.appendTo($sb);

		const $sbItemTitle = $(`<div class="imap-sb-item-title">${region.title}</div>`);
		$sbItemTitle.appendTo($sbItem);

		const $sbItemDescription = $(`<div class="imap-sb-item-description">${region.description}</div>`);
		$sbItemDescription.appendTo($sbItem);

		const $sbItemPointer = $('<div class="imap-sb-item-pointer"></div>');
		$sbItemPointer.css('left', region.position[0]);
		$sbItemPointer.css('top', region.position[1]);
		$sbItemPointer.appendTo($sbItem);
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
				$iMap.find(`#fl-${region.id}`).removeClass('imap-fl-item_active');
				$iMap.find(`#sb-${region.id}`).removeClass('imap-sb-item_active');
				$iMap.find(`#sb-${region.id}`).removeClass('imap-sb-item_click');
			}

			if (! oldShown.includes(region) && newShown.includes(region)) {
				$iMap.find(`#sb-${region.id}`).addClass('imap-sb-item_active');
			}

			if (newShown.includes(region) && event.type === 'click') {
				$iMap.find(`#fl-${region.id}`).addClass('imap-fl-item_active');
				$iMap.find(`#sb-${region.id}`).addClass('imap-sb-item_click');
			}
		});
	});
})($('.imap'), [
	{
		id: 'room',
		points: [
			[860, 7],
			[805, 174],
			[932, 174],
			[932, 7],
		],
		position: [875, 154],
		title: 'Помещение',
		description: 'Неопознанное помещение используется для хранения непонятных вещей и постоянное информационно-пропагандистское обеспечение нашей деятельности в значительной степени обуславливает создание направлений прогрессивного развития',
		color: '#08FF64',
	},
	{
		id: 'rails',
		points: [
			[2, 66],
			[2, 582],
			[66, 582],
			[66, 66],
		],
		position: [32, 202],
		title: 'Железная дорога',
		description: 'Служит для приема и отправки грузов поездом',
		color: '#FFFFFF',
	},
	{
		id: 'zone1',
		points: [
			[98, 237],
			[98, 387],
			[423, 387],
			[423, 237],
		],
		position: [370, 276],
		title: 'Зона 1',
		description: 'Зона 1 используется для хранения различной атрибутики необходимой в повседневной деятельности',
		color: '#FF0000',
	},
	{
		id: 'zone2',
		points: [
			[470, 237],
			[470, 387],
			[691, 387],
			[691, 334],
			[795, 334],
			[795, 237],
		],
		position: [630, 364],
		title: 'Зона 2',
		description: 'Зона 2 используется для хранения различной атрибутики необходимой в повседневной деятельности',
		color: '#FF0000',
	},
	{
		id: 'zone3',
		points: [
			[98, 448],
			[98, 521],
			[194, 562],
			[373, 563],
			[403, 504],
			[403, 448],
		],
		position: [350, 480],
		title: 'Зона 3',
		description: 'Зона 3 используется для хранения различной атрибутики необходимой в повседневной деятельности',
		color: '#FF0000',
	},
	{
		id: 'stock',
		points: [
			[500, 462],
			[500, 577],
			[714, 577],
			[714, 462],
		],
		position: [670, 556],
		title: 'Склад',
		description: 'Склад используется для хранения различной атрибутики необходимой в повседневной деятельности',
		color: '#FF0000',
	},
]);
