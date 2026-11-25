"""Tests for tools/torrent-arr.py: python3 -I -m unittest discover -s tools"""
import hashlib
import importlib.util
import os
import unittest

spec = importlib.util.spec_from_file_location("torrent_arr", os.path.join(os.path.dirname(__file__), "torrent-arr.py"))
ta = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ta)


def torrent(info: bytes) -> bytes:
    return b"d8:announce14:http://t/a/ann13:creation datei1700000000e4:info" + info + b"e"


class TorrentMeta(unittest.TestCase):
    def test_hash_is_sha1_of_the_info_dict_only(self):
        # a wrong span gives a hash qBittorrent never reports: unblock would never match
        name = b"The.Truman.Show.1998.1080p.DUAL.mkv"
        info = b"d6:lengthi10e4:name" + b"%d:" % len(name) + name + b"12:piece lengthi16384e6:pieces20:" + b"x" * 20 + b"e"
        name, ihash = ta.torrent_meta(torrent(info))
        self.assertEqual(ihash, hashlib.sha1(info).hexdigest())
        self.assertEqual(name, "The.Truman.Show.1998.1080p.DUAL")

    def test_name_utf8_wins_over_name(self):
        info = b"d4:name3:abc10:name.utf-89:Dark.S01Ee"
        self.assertEqual(ta.torrent_meta(torrent(info))[0], "Dark.S01E")


class Kind(unittest.TestCase):
    def test_series_markers(self):
        for n in ["Ted.Lasso.S03.1080p", "Severance.S02E05", "Friends 1x02", "The Office Season 4", "Dark.Temporada.2"]:
            self.assertEqual(ta.kind_of(n), "sonarr", n)

    def test_movies_that_look_like_markers(self):
        # Se7en, S1m0ne, x264 and DTS10 must not send a movie to Sonarr
        for n in ["The.Truman.Show.1998.1080p", "Se7en.1995.1080p", "S1m0ne.2002", "Mission.Impossible.x264", "2001.A.Space.Odyssey.1968", "Oceans.Twelve.2004.BluRay.DTS10"]:
            self.assertEqual(ta.kind_of(n), "radarr", n)


class PickYear(unittest.TestCase):
    results = [{"title": "Wallace & Gromit: Vengeance Most Fowl", "year": 2024}]

    def test_a_year_off_is_the_same_title(self):
        # release says 2025, TMDB 2024: without the slack the movie is never added
        self.assertEqual(ta.pick_year(self.results, 2025), self.results[0])

    def test_a_far_year_adds_nothing(self):
        # a remake years apart must not be added in place of the release
        self.assertIsNone(ta.pick_year(self.results, 2030))

    def test_no_year_takes_the_first(self):
        self.assertEqual(ta.pick_year(self.results, None), self.results[0])


if __name__ == "__main__":
    unittest.main()
