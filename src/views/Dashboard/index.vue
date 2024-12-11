<template>
	<div>
		<div class="dashboard">
			<h1>{{ title }}</h1>
			<p>{{ description }}</p>
		</div>
		<div class="grid grid-cols-1 gap-4">
			<n-space>
				<n-button>Default</n-button>
				<n-button type="tertiary">Tertiary</n-button>
				<n-button type="primary">Primary</n-button>
				<n-button type="info">Info</n-button>
				<n-button type="success">Success</n-button>
				<n-button type="warning">Warning</n-button>
				<n-button type="error">Error</n-button>
			</n-space>
			<n-space>
				<n-tag round :bordered="false">Real Love</n-tag>
				<n-tag type="success" round :bordered="false">Yes It Is</n-tag>
				<n-tag type="warning" round :bordered="false">I'm Down</n-tag>
				<n-tag type="error" round :bordered="false">Yesterday</n-tag>
				<n-tag type="info" round :bordered="false">I'm Looking Through You</n-tag>
			</n-space>

			<n-button @click="showModal = true">Start me up</n-button>
			<n-modal
				v-model:show="showModal"
				class="custom-card"
				preset="card"
				:style="bodyStyle"
				title="Modal"
				:bordered="false"
				size="huge"
				:segmented="segmented"
			>
				<template #header-extra>Oops!</template>
				Content
				<template #footer></template>
			</n-modal>
			<n-space vertical>
				<n-progress type="line" :percentage="percentage" :show-indicator="false" />
				<n-progress type="line" :percentage="percentage" />
				<n-progress type="line" :percentage="percentage" indicator-placement="inside" />
				<n-progress type="line" status="info" :percentage="percentage" :show-indicator="false" />
				<n-progress type="line" status="info" :percentage="percentage" />
				<n-progress type="line" status="info" :percentage="percentage" indicator-placement="inside" />
				<n-progress type="line" status="success" :percentage="percentage" :show-indicator="false" />
				<n-progress type="line" status="success" :percentage="percentage" />
				<n-progress type="line" status="success" :percentage="percentage" indicator-placement="inside" />
				<n-progress type="line" status="warning" :percentage="percentage" :show-indicator="false" />
				<n-progress type="line" status="warning" :percentage="percentage" />
				<n-progress type="line" status="warning" :percentage="percentage" indicator-placement="inside" />
				<n-progress type="line" status="error" :percentage="percentage" :show-indicator="false" />
				<n-progress type="line" status="error" :percentage="percentage" />
				<n-progress type="line" status="error" :percentage="percentage" indicator-placement="inside" />
				<n-space>
					<n-button @click="minus">Minus 10%</n-button>
					<n-button @click="add">Add 10%</n-button>
				</n-space>
			</n-space>
			<n-data-table
				:bordered="false"
				:single-line="false"
				:columns="columns"
				:data="data"
				:pagination="pagination"
			/>
			<n-tabs type="line" animated>
				<n-tab-pane name="oasis" tab="Oasis">Wonderwall</n-tab-pane>
				<n-tab-pane name="the beatles" tab="the Beatles">Hey Jude</n-tab-pane>
				<n-tab-pane name="jay chou" tab="Jay Chou">Qilixiang</n-tab-pane>
			</n-tabs>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, h } from "vue"
import { NButton, NModal, NSpace, NTag, NProgress, useMessage, NDataTable, NTabs, NTabPane } from "naive-ui"
import type { DataTableColumns } from "naive-ui"
interface RowData {
	key: number
	name: string
	age: number
	address: string
	tags: string[]
}

function createColumns({ sendMail }: { sendMail: (rowData: RowData) => void }): DataTableColumns<RowData> {
	return [
		{
			title: "Name",
			key: "name"
		},
		{
			title: "Age",
			key: "age"
		},
		{
			title: "Address",
			key: "address"
		},
		{
			title: "Tags",
			key: "tags",
			render(row) {
				const tags = row.tags.map(tagKey => {
					return h(
						NTag,
						{
							style: {
								marginRight: "6px"
							},
							type: "info",
							bordered: false
						},
						{
							default: () => tagKey
						}
					)
				})
				return tags
			}
		},
		{
			title: "Action",
			key: "actions",
			render(row) {
				return h(
					NButton,
					{
						size: "small",
						onClick: () => sendMail(row)
					},
					{ default: () => "Send Email" }
				)
			}
		}
	]
}

function createData(): RowData[] {
	return [
		{
			key: 0,
			name: "John Brown",
			age: 32,
			address: "New York No. 1 Lake Park",
			tags: ["nice", "developer"]
		},
		{
			key: 1,
			name: "Jim Green",
			age: 42,
			address: "London No. 1 Lake Park",
			tags: ["wow"]
		},
		{
			key: 2,
			name: "Joe Black",
			age: 32,
			address: "Sidney No. 1 Lake Park",
			tags: ["cool", "teacher"]
		}
	]
}

export default defineComponent({
    name: 'Dashboard',
	components: { NButton, NModal, NSpace, NTag, NProgress, NDataTable, NTabs, NTabPane },
	setup() {
		const message = useMessage()
		const title = ref<string>("Dashboard")
		const description = ref<string>("Welcome to the dashboard page.")
		const bodyStyle = {
			width: "600px"
		}
		const segmented = {
			content: "soft",
			footer: "soft"
		} as const
		const showModal = ref(false)
		const percentageRef = ref(0)

		const add = () => {
			percentageRef.value += 10
			if (percentageRef.value > 100) {
				percentageRef.value = 0
			}
		}

		const minus = () => {
			percentageRef.value -= 10
			if (percentageRef.value < 0) {
				percentageRef.value = 100
			}
		}
		return {
			title,
			description,
			bodyStyle,
			segmented,
			showModal,
			percentage: percentageRef,
			add,
			minus,
			data: createData(),
			columns: createColumns({
				sendMail(rowData) {
					message.info(`send mail to ${rowData.name}`)
				}
			}),
			pagination: {
				pageSize: 10
			}
		}
	}
})
</script>

<style scoped>
.dashboard {
	padding: 20px;
}

h1 {
	font-size: 2em;
}

p {
	font-size: 1.2em;
}
</style>
