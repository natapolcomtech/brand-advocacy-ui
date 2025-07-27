<template>
	<div>
		<h1>General Data</h1>
		<div class="mb-6 mt-4 flex flex-col md:flex-row justify-between gap-4">
			<n-select
				class="md:!w-[400px]"
				:options="systemDataOptions"
				:render-label="renderLabel"
				v-model:value="systemDataFilter"
				placeholder="Please Select Category"
			/>

			<n-button @click="handleCreateUser" type="primary" size="large">
				<template #icon>
					<Icon icon="icons8:plus" />
				</template>
				Create Master Data
			</n-button>
		</div>

		<n-data-table :columns="column" :data="systemMasterData.systemData" scroll-x-auto/>

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
				<n-form-item label="Category Name" path="category">
					<n-input
						v-model:value="systemData.category"
						size="large"
						placeholder="Please Enter Category Name"
						:disabled="isModalManagement.event === MODAL_TYPE.EDIT"
					/>
				</n-form-item>
				<n-form-item label="Label Name" path="label">
					<n-input v-model:value="systemData.label" size="large" placeholder="Please Enter Label Name" />
				</n-form-item>
				<n-form-item label="Value Number" path="value">
					<n-input v-model:value="systemData.value" size="large" placeholder="Please Enter Value Number" />
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
import { NDataTable, NModal, NInput, NSpace, NSelect, NButton, NForm, NFormItem, NSwitch } from "naive-ui"

import { Icon } from "@iconify/vue"

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
		NFormItem
	},
	setup() {
		const systemMasterData = useSystemMasterData()
		const formRef = ref<FormInst | null>(null)
		const capabilitys = ref<any>([])
		const dialog = useDialog()
		const isModalManagement = reactive({
			value: false,
			event: MODAL_TYPE.CREATE
		})
		const titleModal = computed(() => {
			switch (isModalManagement.event) {
				case MODAL_TYPE.CREATE:
					return "Create Master Data"
				case MODAL_TYPE.EDIT:
					return "Edit Master Data"
				case MODAL_TYPE.PERMISSION:
					return "Permission"
				default:
					return ""
			}
		})
		const defaultValue = {
			id: 0,
			category: "",
			label: "",
			value: "",
			sequence: "",
			is_active: 1,
			is_visible: 1,
			is_delete: 0
		}
		const systemDataFilter = ref(null)
		const systemData = reactive({ ...defaultValue })
		const systemDataOptions = reactive([])
		onMounted(async () => {
			await systemMasterData.getSystemMasterData()
			Object.assign(
				systemDataOptions,
				systemMasterData.systemDataOptions.map((item: any) => {
					return {
						label: item,
						value: item
					}
				})
			)
		})
		watch(
			async () => systemDataFilter.value,
			async () => {
				const category = systemDataFilter.value
				await systemMasterData.getSystemMasterDataByCategory({ category })
			}
		)
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
			const category = systemDataFilter.value
			const bodyEdit = {
				id: systemData.id,
				category: systemData.category.trim().toLowerCase(),
				label: systemData.label,
				value: Number(systemData.value),
				sequence: Number(systemData.sequence),
				is_visible: systemData.is_visible,
				is_active: systemData.is_active,
				is_delete: systemData.is_delete
			}
			const bodyCreate = {
				category: systemData.category.trim().toLowerCase(),
				label: systemData.label,
				value: Number(systemData.value),
				sequence: Number(systemData.sequence)
			}
			formRef.value?.validate(async errors => {
				if (!errors) {
					switch (isModalManagement.event) {
						case MODAL_TYPE.CREATE:
							await systemMasterData.createSystemMasterData(bodyCreate)
							await systemMasterData.getSystemMasterDataByCategory({ category })
							break
						case MODAL_TYPE.EDIT:
							await systemMasterData.updateSystemMasterData(bodyEdit)
							await systemMasterData.getSystemMasterDataByCategory({ category })
							break
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
						return h("div", { class: "flex gap-x-2 justify-center" }, index + 1)
					}
				},
				{
					title: "Label",
					key: "label",
					width: "350px",
					className: " whitespace-nowrap truncate "
				},
				{
					title: "Value",
					key: "value",
					width: "150px",
					align: "center"
				},
				{
					title: "Sequence",
					key: "sequence",
					align: "center",
					width: "200px"
				},
				{
					title: "Status",
					key: "is_visible",
					align: "center",
					width: "150px",
					render(row) {
						async function handleSwitchChange(value: boolean) {
							row.is_visible = value ? 1 : 0
							const body = {
								id: row.id,
								category: row.category,
								label: row.label,
								value: row.value,
								sequence: row.sequence,
								is_visible: row.is_visible,
								is_active: row.is_active,
								is_delete: row.is_delete
							}
							await systemMasterData.updateSystemMasterData(body)
						}
						return h("div", { class: "flex gap-x-2 justify-center" }, [
							h(NSwitch, {
								value: row.is_visible === 1 ? true : false,
								onUpdateValue: handleSwitchChange,
								vModel: row.is_visible
							})
						])
					}
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
									const item = systemMasterData.systemData.find((item: any) => item.id === row.id)
									e.preventDefault()
									Object.assign(systemData, item, {
										value: item.value.toString(),
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
									const body = {
										id: row.id,
										category: row.category,
										label: row.label,
										value: row.value,
										sequence: row.sequence,
										is_visible: row.is_visible,
										is_active: 0,
										is_delete: 1
									}
									const category = systemDataFilter.value
									dialog.warning({
										title: "ยืนยันการลบข้อมูล",
										content: `ข้อมูลที่ลบจะไม่สามารถกู้คืนได้ คุณแน่ใจที่จะลบข้อมูล ${row.category} ID: ${row.id} ลับดำที่  ${row.sequence} หรือไม่ ?`,
										positiveText: "แน่ใจ",
										negativeText: "ยกเลิก",
										onPositiveClick: async () => {
											await systemMasterData.updateSystemMasterData(body)
											await systemMasterData.getSystemMasterDataByCategory({ category })
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
			category: [
				{
					required: true,
					message: "Please enter Category Name",
					trigger: "blur"
				}
			],
			label: [
				{
					required: true,
					message: "Please enter Label Name",
					trigger: "blur"
				}
			],
			value: {
				required: true,
				message: "Please enter Value Number",
				trigger: "blur"
			},
			sequence: {
				required: true,
				message: "Please enter Value Sequence",
				trigger: "blur"
			}
		}

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
			capabilitys,
			MODAL_TYPE,
			renderMultipleSelectTag,
			renderLabel,
			systemMasterData,
			systemDataFilter
		}
	}
})
</script>
