function getFormattedTime(timeInSeconds) {
	let h, m, s, h1;
	h = Math.floor(timeInSeconds/60/60);
	m = Math.floor((timeInSeconds/60/60 - h)*60);
	s = Math.floor(((timeInSeconds/60/60 - h)*60 - m)*60);

	s = s < 10 ? `0${s}`: `${s}`;
	m = m < 10 ? `0${m}`: `${m}`;
	h1 = h < 10 ? `0${h}`: `${h}`;

	return h > 0 ? `${h1}:${m}:${s}` : `${m}:${s}`;
}
