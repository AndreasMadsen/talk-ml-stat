
all: poster webm

poster: pigeon-clock-input.jpg pigeon-turn-peck.jpg
webm: pigeon-clock-input.webm pigeon-turn-peck.webm

%.jpg: %.mp4
	ffmpeg -i $< -ss 00:00:00.500 -vframes 1 -f image2 $@

%.webm: %.mp4
	ffmpeg -i $< -strict -2 $@
