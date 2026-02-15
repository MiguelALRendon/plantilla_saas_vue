<template>
<LookupItem
    v-for="(item, index) in data"
    :key="index"
    :itemFromList="item"
    @click="clickedItrem(item)"
/>
</template>

<script lang="ts">
import { BaseEntity } from '@/entities/base_entity';
import { Products } from '@/entities/products';
import LookupItem from '@/components/Informative/LookupItem.vue';
import Application from '@/models/application';

    export default {
        name: "DefaultLookupListView",
        components: {
            LookupItem
        },
        methods: {
            clickedItrem(item: BaseEntity) {
                Application.ApplicationUIService.closeModalOnFunction(item);
            }
        },
        data() {
        const data : BaseEntity[] = [];
        for (let i = 1; i <= 50; i++) {
            data.push(
                new Products({
                    id: i,
                    name: `Producto ${i}Sss`,
                    description: `Descripción del producto asdf fasdfasdfasdf ta sdf sd fasdf   asdfasdfasdf asdfasfafsdf ${i}`,
                    price: Math.floor(Math.random() * 100) + 1,
                    stock: Math.floor(Math.random() * 50) + 1,
                    product: new Products({
                        id: i + 100,
                        name: `Inner Producto ${i}`,
                        description: `Inner Descripción del producto ${i}`,
                        price: Math.floor(Math.random() * 100) + 1,
                        stock: Math.floor(Math.random() * 50) + 1,
                    })
                })
            );
        }
        
        return {
            BaseEntity,
            data
        }
    },
    };
</script>