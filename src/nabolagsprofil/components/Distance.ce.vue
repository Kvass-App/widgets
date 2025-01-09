<script setup>
import { Flex, DataTable, Icon } from '@kvass/ui'
import { computed } from 'vue'

const props = defineProps({
  profile: Object,
  distances: Array,
  iconsMap: Object,
})

const getItem = (name) => {
  const groups = props.profile?.poiGroups || []
  return groups.find((g) => g.name === name)
}

const data = computed(() => {
  const nameMap = {
    'Varer/tjenester': 'Varer\xa0/\xa0Tjenester',
  }

  return props.distances
    .map((d) => getItem(d))
    .filter(Boolean)
    .map((v) => {
      return {
        id: v.name,
        label: nameMap[v.name] || v.name,
        items: v.pois,
        columns: [
          { id: 'name', label: nameMap[v.name] || v.name, size: '1fr' },
          {
            id: 'classes',
            label: 'Klasser',
            disabled: !v.pois.find((v) => v?.school?.classes),
            align: 'end',
          },
          {
            id: 'students',
            label: 'Elever',
            disabled: !v.pois.find((v) => v?.school?.students),
            align: 'end',
          },
          {
            id: 'distances',
            label: 'Avstand',
            disabled: !v.pois.find((v) => v?.distances),
            align: 'end',
          },
          {
            id: 'duration',
            label: 'Tid',
            disabled: !v.pois.find((v) => v?.duration),
            align: 'end',
          },
        ],
      }
    })
})

const mobileData = computed(() => {
  return data.value.map((v) => {
    return {
      ...v,
      columns: v.columns
        .filter((v) => !['name'].includes(v.id))
        .map((v) => {
          return {
            ...v,
            align: 'start',
          }
        }),
    }
  })
})

const getDistance = (item) => {
  const distance = item.distances
  const property = distance.selected
  return `${distance[property]} ${distance.unit}`
}

const getDuration = (item) => {
  const property = item.distances.selected
  const distance = item?.duration?.[property]

  if (!distance) return ''
  return `${Math.floor(distance / 60)} min`
}

const getIcon = (id) => {
  const map = {
    // 110 -> Avstand ?
    210: 'fa-pro-solid:plane',
    211: 'fa-pro-solid:plane',
    220: 'fa-pro-solid:train',
    221: 'fa-pro-solid:train',
    230: 'fa-pro-solid:tram',
    235: 'fa-pro-solid:map-pin',
    240: 'fa-pro-solid:bus',
    250: 'fa-pro-solid:ship',
    // 270 -> Elbil ?
    310: 'fa-pro-solid:futbol',
    330: 'fa-pro-solid:dumbbell',
    401: 'fa-pro-solid:school',
    402: 'fa-pro-solid:school',
    500: 'fa-pro-solid:graduation-cap',
    550: 'fa-pro-solid:graduation-cap',
    551: 'fa-pro-solid:graduation-cap',
    // 600 -> barnehage
    700: 'fa-pro-solid:bag-shopping',
    900: 'fa-pro-solid:suitcase-medical',
    1000: 'fa-pro-solid:wine-bottle',
    1100: 'fa-pro-solid:cart-shopping',
    walk: 'fa-pro-solid:walking',
    drive: 'fa-pro-solid:car-side',
    air: 'fa-pro-solid:plane',
    ...props.iconsMap,
  }

  return map[id] || 'fa-pro-solid:question'
}
</script>

<template>
  <Flex class="distance" direction="column" gap="3rem" is="section">
    <template v-for="(item, index) in data">
      <DataTable
        :items="item.items"
        :sticky="false"
        :columns="item.columns"
        theme="border"
        class="distance__desktop-table"
      >
        <template #name-label="{ item }">
          <h2>{{ item.label }}</h2>
        </template>

        <template #name="{ item }">
          <Flex gap="4px">
            <Icon :icon="getIcon(item.poitypeId)" />
            <span>{{ item.name }}</span>
          </Flex>
        </template>
        <template #classes="{ item }">
          {{ item?.school?.classes }}
        </template>
        <template #students="{ item }">
          {{ item?.school?.students }}
        </template>
        <template #distances="{ item }">
          {{ getDistance(item) }}
        </template>
        <template #duration="{ item }">
          <template v-if="getDuration(item)">
            <Flex gap="4px">
              <Icon :icon="getIcon(item?.distances?.selected)" />
              <span>{{ getDuration(item) }}</span>
            </Flex>
          </template>
        </template>
      </DataTable>
    </template>

    <template v-for="item in mobileData">
      <div class="distance__mobile-table">
        <h2 class="distance__label">{{ item.label }}</h2>

        <Flex direction="column" gap="2rem">
          <div v-for="i in item.items">
            <Flex gap="4px" class="k-datatable__cell">
              <Icon :icon="getIcon(i.poitypeId)" />
              <span>{{ i.name }}</span>
            </Flex>
            <DataTable theme="border" :items="[i]" :columns="item.columns">
              <template #classes="{ item }">
                {{ item?.school?.classes }}
              </template>
              <template #students="{ item }">
                {{ item?.school?.students }}
              </template>
              <template #distances="{ item }">
                {{ getDistance(item) }}
              </template>
              <template #duration="{ item }">
                <template v-if="getDuration(item)">
                  <Flex gap="4px">
                    <Icon :icon="getIcon(item?.distances?.selected)" />
                    <span>{{ getDuration(item) }}</span>
                  </Flex>
                </template>
              </template>
            </DataTable>
          </div>
        </Flex>
      </div>
    </template>
  </Flex>
</template>

<style lang="scss">
.distance {
  .k-datatable {
    &__cell-sort-icon {
      display: none;
    }

    &__cell {
      padding: var(--kvass-nabolagsprofil-distance-cell-padding);
    }

    &__row {
      &:first-child {
        .k-datatable__cell {
          background-color: initial;
          font-weight: var(--kvass-nabolagsprofil-distance-header-font-weight);
          font-size: var(--kvass-nabolagsprofil-distance-header-font-size);
        }
      }
    }
  }

  &__desktop-table {
    @media (max-width: 992px) {
      display: none;
    }
    .k-datatable {
      &__row {
        &:first-child {
          .k-datatable__cell {
            padding: var(--kvass-nabolagsprofil-distance-header-padding);
            margin-block: var(--kvass-nabolagsprofil-distance-header-spacing-y);
          }
        }
        &:not(:first-child) {
          .k-datatable__cell {
            border-bottom: none;
          }
        }
      }
    }
  }

  &__mobile-table {
    @media (min-width: 992px) {
      display: none;
    }

    .distance__label {
      margin-bottom: 2rem;
    }

    .k-datatable {
      &__row {
        &:first-child {
          .k-datatable__cell {
            // padding: 0.5rem;
            border-top: 1px solid
              var(--k-datatable-border-color, var(--k-ui-color-neutral-light));
          }
        }
      }
    }
  }
}
</style>
