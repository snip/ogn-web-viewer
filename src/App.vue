<template>
  <div id="app">
    <template v-if="loaded">
      <Map :task="task"></Map>
    </template>
    <div class="loading" v-else>Loading...</div>
  </div>
</template>

<script>
import URLSearchParams from 'url-search-params';
import axios from 'axios';

import Map from './components/map';
import deviceFilter from './services/filter';

export default {
  name: 'app',

  components: {
    Map,
  },

  data() {
    return {
      loaded: false,
      task: null,
    };
  },

  mounted() {
    this.loadData();
  },

  methods: {
    async loadData() {
      let hash = location.hash || '';
      let params = new URLSearchParams(hash.substr(1));

      await Promise.all([this.loadDeviceFilter(params.get('lst')), this.loadTask(params.get('tsk'))]);

      this.loaded = true;
    },

    async loadDeviceFilter(url) {
      if (url) {
        await deviceFilter.load(url);
      }
    },

    async loadTask(url) {
      if (url) {
        let { readTaskFromString } = await import('aeroscore/dist/src/read-task');
        let { data } = await axios(`/api/cors-proxy/${url}`);
        this.task = readTaskFromString(data);
      }
    },
  },
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
}

.loading {
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;

  font-family: sans-serif;
  font-size: 30px;
}
</style>
