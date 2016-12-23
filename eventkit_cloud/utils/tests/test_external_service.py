# -*- coding: utf-8 -*-
import logging
import os
import json
import yaml as real_yaml
from mock import Mock, patch
from django.core.files.temp import NamedTemporaryFile
from django.conf import settings
from django.test import TransactionTestCase
from ..external_service import ExternalRasterServiceToGeopackage, create_conf_from_url
from mapproxy.config.config import base_config

logger = logging.getLogger(__name__)


class TestWMTSToGeopackage(TransactionTestCase):
    def setUp(self, ):
        self.path = settings.ABS_PATH()


    @patch('eventkit_cloud.utils.external_service.yaml')
    @patch('eventkit_cloud.utils.external_service.NamedTemporaryFile')
    @patch('eventkit_cloud.utils.external_service.config_command')
    def test_create_conf_from_arcgis(self, config_command, temp, yaml):
        test_file = NamedTemporaryFile()
        url = 'http://server.arcgisonline.com/arcgis/rest/services/ESRI_Imagery_World_2D/MapServer'
        test_yaml = "layer:\r\n  - name: imagery\r\n    title: imagery\r\n    sources: [cache]\r\n\r\nsources:\r\n  imagery_arcgis:\r\n    type: arcgis\r\n    grid: webmercator\r\n    req:\r\n      url: http://server.arcgisonline.com/arcgis/rest/services/ESRI_Imagery_World_2D/MapServer\r\n      layers: \r\n        show: 0\r\n\r\ngrids:\r\n  webmercator:\r\n    srs: EPSG:3857\r\n    tile_size: [256, 256]\r\n    origin: nw"
        temp.return_value = test_file
        config_command.return_value = test_yaml
        yaml.load.return_value = real_yaml.load(test_yaml)
        cmd = ['--capabilities', '{}'.format(url), '--output', '{}'.format(test_file.name), '--force']
        w2g = create_conf_from_url(url)
        config_command.assert_called_once_with(cmd)
        self.assertEqual(w2g, real_yaml.load(test_yaml))

    @patch('eventkit_cloud.utils.external_service.SeedingConfiguration')
    @patch('eventkit_cloud.utils.external_service.seeder')
    @patch('eventkit_cloud.utils.external_service.Process')
    @patch('eventkit_cloud.utils.external_service.load_config')
    @patch('eventkit_cloud.utils.external_service.get_cache_template')
    @patch('eventkit_cloud.utils.external_service.get_seed_template')
    def test_convert(self, seed_template, cache_template, load_config, process, seeder, seeding_config):
        process.return_value = Mock()
        gpkgfile = '/var/lib/eventkit/test.gpkg'
        config = "layer:\r\n  - name: imagery\r\n    title: imagery\r\n    sources: [cache]\r\n\r\nsources:\r\n  imagery_arcgis:\r\n    type: arcgis\r\n    grid: webmercator\r\n    req:\r\n      url: http://server.arcgisonline.com/arcgis/rest/services/ESRI_Imagery_World_2D/MapServer\r\n      layers: \r\n        show: 0\r\n\r\ngrids:\r\n  webmercator:\r\n    srs: EPSG:3857\r\n    tile_size: [256, 256]\r\n    origin: nw"
        json_config = real_yaml.load(config)
        mapproxy_base = base_config()
        cache_template.return_value = {'cache': {'sources': ['imagery_arcgis'], 'cache': {'type': 'geopackage', 'filename': '/var/lib/eventkit/test.gpkg'}, 'grids': ['webmercator']}}
        seed_template.return_value = {'coverages': {'geom': {'srs': 'EPSG:4326', 'bbox': [-2, -2, 2, 2]}}, 'seeds': {'seed': {'coverages': ['geom'], 'refresh_before': {'minutes': 0}, 'levels': {'to': 10, 'from': 0}, 'caches': ['cache']}}}
        w2g = ExternalRasterServiceToGeopackage(config=config,
                               gpkgfile=gpkgfile,
                               bbox=[-2, -2, 2, 2],
                               service_url='http://server.arcgisonline.com/arcgis/rest/services/ESRI_Imagery_World_2D/MapServer',
                               layer='imagery',
                               debug=True,
                               name='imagery',
                               level_from=0,
                               level_to=10,
                               service_type='arcgis')
        result = w2g.convert()
        self.assertEqual(result, gpkgfile)

        cache_template.assert_called_once_with(["imagery_arcgis"], [grids for grids in json_config.get('grids')], gpkgfile)
        json_config['caches'] = {'cache': {'sources': ['imagery_arcgis'], 'cache': {'type': 'geopackage', 'filename': '/var/lib/eventkit/test.gpkg'}, 'grids': ['webmercator']}}
        json_config['globals'] = {'http': {'ssl_no_cert_checks': True}}

        load_config.assert_called_once_with(mapproxy_base, config_dict=json_config)

        seed_dict = {'cache': {'sources': ['imagery_arcgis'], 'cache': {'type': 'geopackage', 'filename': '/var/lib/eventkit/test.gpkg'}, 'grids': ['webmercator']}}
        seed_template.assert_called_once_with(bbox=[-2, -2, 2, 2], level_from=0, level_to=10)
        process.assert_called_once()

class TestWMTSToGeopackage(TransactionTestCase):
    def setUp(self, ):
        self.path = settings.ABS_PATH()

    @patch('eventkit_cloud.utils.external_service.yaml')
    @patch('eventkit_cloud.utils.external_service.NamedTemporaryFile')
    @patch('eventkit_cloud.utils.external_service.config_command')
    def test_create_conf_from_url(self, config_command, temp, yaml):
        test_file = NamedTemporaryFile()
        url = 'http://a.tile.openstreetmap.fr/hot/%(z)s/%(x)s/%(y)s.png'
        test_yaml = "layers:\r\n - name: imagery\r\n   title: imagery\r\n   sources: [cache]\r\n\r\nsources:\r\n  imagery_wmts:\r\n    type: tile\r\n    grid: webmercator\r\n    url: http://a.tile.openstreetmap.fr/hot/%(z)s/%(x)s/%(y)s.png\r\n\r\ngrids:\r\n  webmercator:\r\n    srs: EPSG:3857\r\n    tile_size: [256, 256]\r\n    origin: nw"
        temp.return_value = test_file
        config_command.return_value = test_yaml
        yaml.load.return_value = real_yaml.load(test_yaml)
        cmd = ['--capabilities', '{}'.format(url), '--output', '{}'.format(test_file.name), '--force']
        w2g = create_conf_from_url(url)
        config_command.assert_called_once_with(cmd)
        self.assertEqual(w2g, real_yaml.load(test_yaml))

    @patch('eventkit_cloud.tasks.models.ExportTask')
    @patch('eventkit_cloud.utils.external_service.SeedingConfiguration')
    @patch('eventkit_cloud.utils.external_service.seeder')
    @patch('eventkit_cloud.utils.external_service.load_config')
    @patch('eventkit_cloud.utils.external_service.get_cache_template')
    @patch('eventkit_cloud.utils.external_service.get_seed_template')
    def test_convert(self, seed_template, cache_template, load_config, seeder, seeding_config, export_task):
        gpkgfile = '/var/lib/eventkit/test.gpkg'
        config = "layers:\r\n - name: imagery\r\n   title: imagery\r\n   sources: [cache]\r\n\r\nsources:\r\n  imagery_wmts:\r\n    type: tile\r\n    grid: webmercator\r\n    url: http://a.tile.openstreetmap.fr/hot/%(z)s/%(x)s/%(y)s.png\r\n\r\ngrids:\r\n  webmercator:\r\n    srs: EPSG:3857\r\n    tile_size: [256, 256]\r\n    origin: nw"
        json_config = real_yaml.load(config)
        mapproxy_base = base_config()
        cache_template.return_value = {'cache': {'sources': ['imagery_wmts'], 'cache': {'type': 'geopackage', 'filename': '/var/lib/eventkit/test.gpkg'}, 'grids': ['webmercator']}}
        seed_template.return_value = {'coverages': {'geom': {'srs': 'EPSG:4326', 'bbox': [-2, -2, 2, 2]}}, 'seeds': {'seed': {'coverages': ['geom'], 'refresh_before': {'minutes': 0}, 'levels': {'to': 10, 'from': 0}, 'caches': ['cache']}}}
        w2g = ExternalRasterServiceToGeopackage(config=config,
                               gpkgfile=gpkgfile,
                               bbox=[-2, -2, 2, 2],
                               service_url='http://generic.server/WMTS?SERVICE=WMTS&REQUEST=GetTile&TILEMATRIXSET=default028mm&TILEMATRIX=%(z)s&TILEROW=%(y)s&TILECOL=%(x)s&FORMAT=image%%2Fpng',
                               layer='imagery',
                               debug=True,
                               name='imagery',
                               level_from=0,
                               level_to=10,
                               service_type='wmts')
        result = w2g.convert()
        export_task.assert_called_once()
        self.assertEqual(result, gpkgfile)

        cache_template.assert_called_once_with(["imagery_wmts"], [grids for grids in json_config.get('grids')], gpkgfile)
        json_config['caches'] = {'cache': {'sources': ['imagery_wmts'], 'cache': {'type': 'geopackage', 'filename': '/var/lib/eventkit/test.gpkg'}, 'grids': ['webmercator']}}
        json_config['globals'] = {'http': {'ssl_no_cert_checks': True}}

        load_config.assert_called_once_with(mapproxy_base, config_dict=json_config)

        seed_dict = {'cache': {'sources': ['imagery_wmts'], 'cache': {'type': 'geopackage', 'filename': '/var/lib/eventkit/test.gpkg'}, 'grids': ['webmercator']}}
        seed_template.assert_called_once_with(bbox=[-2, -2, 2, 2], level_from=0, level_to=10)
