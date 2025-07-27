<template>
	<div>
		<h1>Topic Data</h1>
		<div class="mb-6 mt-4 flex flex-col md:flex-row justify-end gap-4">
			<n-button @click="handleCreateUser" type="primary" size="large">
				<template #icon>
					<Icon icon="icons8:plus" />
				</template>
				Create Topic Data
			</n-button>
		</div>

		<n-data-table :columns="column" :data="systemMasterData.topics.data" scroll-x-auto />
		<n-pagination
			:item-count="itemCount"
			:page-sizes="PAGE_SIZES"
			show-size-picker
			v-model:page="pagination.page"
			v-model:page-size="pagination.limit"
			class="justify-center mt-4"
		>
			<template #prefix="{ itemCount, startIndex }">
				<div class="hidden md:block">({{ startIndex + 1 }} - {{ paginateCount }}) Of {{ itemCount }} items</div>
			</template>
		</n-pagination>

		<n-modal
			v-if="isModalManagement.event !== MODAL_TYPE.PERMISSION"
			v-model:show="isModalManagement.value"
			preset="card"
			:bordered="false"
			size="huge"
			aria-modal="false"
			:style="{
				width: '600px'
			}"
			:title="titleModal"
		>
			<n-form ref="formRef" :model="systemData" :disabled="isModalManagement.event === 'view'" :rules="rules">
				<n-form-item label="Topic Name" path="topic">
					<n-input v-model:value="systemData.topic" size="large" placeholder="Please Enter Topic Name" />
				</n-form-item>
				<n-form-item label="Sequence Number" path="sequence">
					<n-input
						v-model:value="systemData.sequence"
						size="large"
						placeholder="Please Enter Value Sequence"
					/>
				</n-form-item>
			</n-form>
			<template #footer>
				<n-space justify="end">
					<n-button type="default" size="large" @click="handleCancelUser">Cancel</n-button>
					<n-button
						type="primary"
						size="large"
						v-if="isModalManagement.event === 'edit'"
						@click="handleSubmitMaster"
					>
						Save
					</n-button>
					<n-button
						type="primary"
						size="large"
						v-if="isModalManagement.event === 'create'"
						@click="handleSubmitMaster"
					>
						Create
					</n-button>
				</n-space>
			</template>
		</n-modal>
	</div>
</template>

<script lang="ts">
import { defineComponent, h, ref, computed, watch, onMounted, reactive } from "vue"
import { NDataTable, NModal, NInput, NSpace, NSelect, NButton, NForm, NFormItem, NPagination } from "naive-ui"

import { Icon } from "@iconify/vue"
import { PAGE_SIZES } from "@/components/utils/constants"
import type { DataTableColumns } from "naive-ui"
import { useSystemMasterData } from "@/stores/useSystemMasterData"
import type { FormInst, FormRules } from "naive-ui"
import { useDialog } from "naive-ui"
import { MODAL_TYPE } from "@/views/UserManagement/User/index.vue"
import { renderMultipleSelectTag, renderLabel } from "@/components/common/SelectNaiveStyle"

export default defineComponent({
	name: "User",
	components: {
		NDataTable,
		NModal,
		NInput,
		NSpace,
		NSelect,
		NButton,
		Icon,
		NForm,
		NFormItem,
		NPagination
	},
	setup() {
		const systemMasterData = useSystemMasterData()
		const formRef = ref<FormInst | null>(null)
		const dialog = useDialog()
		const isModalManagement = reactive({
			value: false,
			event: MODAL_TYPE.CREATE
		})
		const titleModal = computed(() => {
			switch (isModalManagement.event) {
				case MODAL_TYPE.CREATE:
					return "Create Topic Master Data"
				case MODAL_TYPE.EDIT:
					return "Edit Topic Master Data"
				case MODAL_TYPE.PERMISSION:
					return "Permission"
				default:
					return ""
			}
		})
		const defaultValue = {
			id: 0,
			topic: "",
			sequence: "",
			is_active: 1,
			is_delete: 0
		}
		const systemDataFilter = ref(null)
		const systemData = reactive({ ...defaultValue })
		const systemDataOptions = reactive([])
		onMounted(async () => {
			await systemMasterData.getTopicMasterData({pagination})
		})
		const pagination = reactive({
			page: 1,
			limit: 10,
		})
		const paginateCount = computed(() => {
			const countPage = pagination.limit * pagination.page
			const totalTeams = systemMasterData?.topics?.total ?? 0
			return countPage > totalTeams ? totalTeams : countPage
		})
		const itemCount = computed(() => {
			return systemMasterData?.topics.total || 0
		})
		function handleCreateUser(e: MouseEvent) {
			e.preventDefault()
			Object.assign(systemData, defaultValue)
			isModalManagement.value = true
			isModalManagement.event = MODAL_TYPE.CREATE
		}
		function handleCancelUser(e: MouseEvent) {
			e.preventDefault()
			Object.assign(systemData, defaultValue)
			isModalManagement.value = false
		}
		function handleSubmitMaster(e: MouseEvent) {
			e.preventDefault()

			const bodyEdit = {
				id: systemData.id,
				topic_name: systemData.topic.trim().toLowerCase(),
				sequence: Number(systemData.sequence),
				is_active: systemData.is_active,
				is_delete: systemData.is_delete
			}
			const bodyCreate = {
				topic_name: systemData.topic.trim().toLowerCase(),
				sequence: Number(systemData.sequence)
			}
			formRef.value?.validate(async errors => {
				if (!errors) {
					switch (isModalManagement.event) {
						case MODAL_TYPE.CREATE:
							await systemMasterData.createTopicMasterData(bodyCreate)
							await systemMasterData.getTopicMasterData({...pagination})
							break
						case MODAL_TYPE.EDIT:
							await systemMasterData.updateTopicMasterData(bodyEdit)
							await systemMasterData.getTopicMasterData({...pagination})
						default:
							break
					}
					handleCancelUser(e)
				} else {
					console.error(errors)
				}
			})
		}

		function createColumns(): DataTableColumns {
			return [
				{
					title: "No",
					key: "no",
					width: "100px",
					className: " whitespace-nowrap",
					align: "center",
					render(row, index) {
						return h("div", { class: "flex gap-x-2 justify-center" }, pagination.limit * (pagination.page - 1) + index + 1)
					}
				},
				{
					title: "Name",
					key: "topic_name",
					width: "350px",
					className: " whitespace-nowrap truncate "
				},
				{
					title: "Sequence",
					key: "sequence",
					align: "center",
					width: "200px"
				},
				{
					title: "Action",
					key: "action",
					className: "!text-center",
					width: "150px",
					render(row) {
						return h("div", { class: "flex gap-x-2 justify-center" }, [
							h(Icon, {
								icon: "flowbite:edit-outline",
								class: " cursor-pointer w-6 h-6",
								onClick: async (e: MouseEvent) => {
									const item = systemMasterData?.topics?.data.find((item: any) => item.id === row.id)
									e.preventDefault()
									Object.assign(systemData, item, {
										topic: item.topic_name.toString(),
										sequence: item.sequence.toString()
									})
									isModalManagement.value = true
									isModalManagement.event = MODAL_TYPE.EDIT
								}
							}),
							h(Icon, {
								icon: "tabler:trash",
								class: " cursor-pointer w-6 h-6",
								onClick: () => {
									dialog.warning({
										title: "ยืนยันการลบข้อมูล",
										content: `ข้อมูลที่ลบจะไม่สามารถกู้คืนได้ คุณแน่ใจที่จะลบข้อมูล ${row.topic_name} ID: ${row.id} ลับดำที่  ${row.sequence} หรือไม่ ?`,
										positiveText: "แน่ใจ",
										negativeText: "ยกเลิก",
										onPositiveClick: async () => {
											await systemMasterData.deleteTopicMasterData(Number(row.id))
											await systemMasterData.getTopicMasterData({ ...pagination })
										},
										onNegativeClick: () => {
											// message.error("Not Sure")
										}
									})
								}
							})
						])
					}
				}
			]
		}
		const column = createColumns()

		const rules: FormRules = {
			topic: [
				{
					required: true,
					message: "Please enter Category Name",
					trigger: "blur"
				}
			],
			sequence: {
				required: true,
				message: "Please enter Value Sequence",
				trigger: "blur"
			}
		}
		watch(pagination, async value => {
			/// Call API
			await systemMasterData?.getTopicMasterData({ ...value })
		})
		return {
			systemDataOptions,
			column,
			systemData,
			handleCreateUser,
			handleCancelUser,
			handleSubmitMaster,
			isModalManagement,
			titleModal,
			rules,
			formRef,
			MODAL_TYPE,
			renderMultipleSelectTag,
			renderLabel,
			systemMasterData,
			systemDataFilter,
			pagination,
			paginateCount,
			itemCount,
			PAGE_SIZES
		}
	}
})
</script>
