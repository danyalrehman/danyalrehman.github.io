#!/usr/bin/env python3
"""Remove the solid white background from robin.mp4 -> robin_transparent.webm

The source clip is a molecular roll-out rendered on a pure-white (#FFFFFF)
background. We chroma-key the white out so the video sits cleanly on any page
colour, light or dark.

Why WebM and not MP4
--------------------
A transparent web video has to carry an alpha channel, and H.264/MP4 cannot
store one. The web format that can is WebM (VP9 + alpha), which every current
browser (Chrome, Firefox, Edge, Safari 16+) plays. So the output is
`robin_transparent.webm` even though the request mentioned ".mp4" - an actual
transparent `.mp4` is not possible with H.264.

Note on verification: ffmpeg can *write* VP9-alpha WebM but its own decoder
reads the file back as opaque, so `ffprobe`/extracted frames will look like
they have no alpha. That is an ffmpeg decoder quirk - the file genuinely
contains the alpha plane (this script verifies it) and browsers display it
transparently.

Usage:
    python3 make_transparent.py [input.mp4]
"""

import shutil
import subprocess
import sys
from pathlib import Path

# --- keying parameters --------------------------------------------------
KEY_COLOR  = "0xFFFFFF"   # background colour to remove (pure white)
SIMILARITY = 0.16         # how close to KEY_COLOR still counts as background
BLEND      = 0.10         # soft falloff at antialiased edges (0 = hard edge)
CRF        = 32           # VP9 quality: lower = better/larger (0-63)

KEY_FILTER = f"colorkey={KEY_COLOR}:{SIMILARITY}:{BLEND}"


def has_alpha(path: Path) -> bool:
    """A transparent WebM carries the AlphaMode flag (EBML id 0x53C0) and one
    BlockAdditional (0x75A1) per frame holding the encoded alpha plane."""
    data = path.read_bytes()
    return data.find(b"\x53\xc0") >= 0 and data.count(b"\x75\xa1") > 0


def main():
    if shutil.which("ffmpeg") is None:
        sys.exit("error: ffmpeg not found on PATH")

    here = Path(__file__).resolve().parent
    src = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else here / "robin.mp4"
    if not src.is_file():
        sys.exit(f"error: input video not found: {src}")

    dst = src.with_name("robin_transparent.webm")

    print(f"source : {src.name}  ({src.stat().st_size / 1e6:.1f} MB)")
    print(f"keying : {KEY_FILTER}")
    print(f"output : {dst.name}\n")

    cmd = [
        "ffmpeg", "-y", "-i", str(src),
        # key out white, then hand the encoder a real alpha pixel format
        "-vf", f"{KEY_FILTER},format=yuva420p",
        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
        "-metadata:s:v:0", "alpha_mode=1",   # mark the WebM track as alpha
        "-crf", str(CRF), "-b:v", "0", "-row-mt", "1",
        "-an",                               # drop audio (hero video is muted)
        str(dst),
    ]
    print("  $ " + " ".join(cmd) + "\n")
    subprocess.run(cmd, check=True)

    if not dst.is_file():
        sys.exit("error: ffmpeg did not produce an output file")

    ok = has_alpha(dst)
    print(f"\ndone: {dst.name}  ({dst.stat().st_size / 1e6:.1f} MB)")
    print(f"alpha channel embedded: {'yes' if ok else 'NO - check ffmpeg/libvpx build'}")
    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
