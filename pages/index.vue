<template>
  <div class="container">
    <div class="row">
      <div class="map-panel col-12 col-lg-8">
        <GmapMap
          ref="mapRef"
          :center="center"
          :zoom="13"
          map-type-id="roadmap"
          style="width: 100%; height: 100%"
          @dragend="getNewList"
          @zoom_changed="getNewList"
        >
          <GmapMarker
            :key="index"
            :icon="place_id==m.place_id ? 'selected_marker.png':'marker.png'"
            :z-index="place_id==m.place_id ? 11:10"
            v-for="(m, index) in r_list"
            :position="m.geometry.location"
            :clickable="true"
            @click="setValue(m)"
          />
        </GmapMap>
      </div>
      <div class="search-panel col-12 col-lg-4">
        <div class="detail-frame">
          <a-list itemLayout="horizontal" :dataSource="Object.keys(r_detail)">
            <a-list-item slot="renderItem" slot-scope="item, index">
              <a-list-item-meta :description="r_detail[item]">
                <div slot="title">{{detail_name[item]}}</div>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </div>
        <div class="list-frame">
          <a-list size="small" bordered :dataSource="r_list">
            <a-list-item
              slot="renderItem"
              slot-scope="item, index"
              :class="{selected: place_id==item.place_id}"
              @click="setValue(item)"
            >{{item.name}}</a-list-item>
            <div slot="header">
              店家名稱
              <a-popover placement="right" title="Title" trigger="click" v-model="toolTip_visible">
                <div class="ml-2 btn btn-sm btn-info">篩選</div>
                <div slot="content">
                  <a-radio-group @change="changeFilter" v-model="filter">
                    <a-radio :value="'location'">距離</a-radio>
                    <a-radio :value="'rating'">評分</a-radio>
                    <a-radio :value="'name'">名稱</a-radio>
                  </a-radio-group>
                </div>
              </a-popover>
            </div>
          </a-list>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { List, Popover, Radio } from "ant-design-vue";
import { callList, callDetail } from "~/actions/api";
export default {
  data() {
    return {
      center: { lat: 25.0169639, lng: 121.2261834 },
      r_list: [],
      r_detail: {},
      detail_name: {
        name: "店家名稱",
        rating: "評分",
        formatted_phone_number: "連絡電話",
        formatted_address: "地址",
        website: "網站"
      },
      place_id: "",
      toolTip_visible: false,
      filter: ""
    };
  },
  components: {
    [List.name]: List,
    [Popover.name]: Popover,
    [Radio.name]: Radio
  },
  methods: {
    async setValue(item) {
      this.center = item.geometry.location;
      this.place_id = item.place_id;
      const res = await callDetail({
        placeid: item.place_id,
        fields: "name,rating,formatted_phone_number,formatted_address,website"
      });
      this.r_detail = res.data.result;
    },
    async getNewList() {
      this.place_id = "";
      this.r_detail = {};
      const center = `${this.$refs.mapRef.$mapObject.center.lat()},${this.$refs.mapRef.$mapObject.center.lng()}`;
      const postData = {
        location: center,
        radius: 1000,
        type: "restaurant",
        language: "zh-TW"
      };
      const finalPostData = { ...postData };
      if (this.filter == "location") {
        delete finalPostData.radius;
        finalPostData.rankby = "distance";
      }

      const res = await callList(finalPostData);

      this.r_list = res.data.results;
      if (this.filter == "rating") {
        this.r_list.sort((a, b) => {
          return b.rating - a.rating;
        });
      }
      if (this.filter == "name") {
        this.r_list.sort((a, b) => {
          var nameA = a.name;
          var nameB = b.name;
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }

          // names must be equal
          return 0;
        });
      }
      // console.log(
      //   this.r_list.sort((a, b) => {
      //     return b.rating - a.rating;
      //   })
      // );
    },
    changeFilter(e) {
      this.filter = e.target.value;
      this.getNewList();
    },
    async filterList() {
      this.place_id = "";
      this.r_detail = {};
      const center = `${this.$refs.mapRef.$mapObject.center.lat()},${this.$refs.mapRef.$mapObject.center.lng()}`;
      const res = await callList({
        location: center,
        // radius: 500,
        type: "restaurant",
        language: "zh-TW",
        rankby: "distance"
      });
      this.r_list = res.data.results;
    }
  },
  async mounted() {
    const res = await callList({
      location: "24.985175,121.440307",
      radius: 1000,
      type: "restaurant",
      language: "zh-TW"
    });
    this.r_list = res.data.results;
    console.log(this.r_list);
  }
};
</script>

<style lang="scss">
.map-panel {
  height: 100vh;
}
.search-panel {
  height: 100vh;
  .detail-frame {
    height: 50%;
    padding: 10px 0;
    .ant-spin-nested-loading {
      max-height: calc(50vh - 20px);
      overflow: auto;
      .ant-list-item-meta-description {
        word-break: break-word;
      }
    }
  }

  .list-frame {
    height: 50%;
    .ant-list-header {
      font-weight: bold;
    }
    .ant-spin-nested-loading {
      max-height: calc(50vh - 50px);
      overflow: auto;
      .selected {
        background: peachpuff;
      }
    }
  }
}
</style>
