<template>
	<div>
		<h1>Incident Management</h1>
		<div class="mb-6 mt-4 flex flex-col md:flex-row justify-between gap-4">
			<div class="flex gap-4">
				<n-input
					:on-update:value="value => handleSearch(value, 'input')"
					type="text"
					placeholder="Search case Id, case name"
					size="large"
					class="md:!w-[260px]"
				>
					<template #suffix>
						<Icon icon="majesticons:search-line" style="color: #d1d1d1" width="24" />
					</template>
				</n-input>

				<n-select
					:on-update:value="value => handleSearch(value, 'feedback_type')"
					class="md:!w-[260px]"
					size="large"
					:render-label="renderLabelTypeFeedback"
					:render-tag="renderSelectTypeFeedback"
					:options="INCIDENT_MANAGEMENT.INCIDENT_TYPE_OPTIONS"
					placeholder="Please Select Type Incident"
				/>
				<n-select
					:on-update:value="value => handleSearch(value, 'status_case')"
					class="md:!w-[260px]"
					size="large"
					:render-label="renderLabelCase"
					:render-tag="renderSelectCase"
					:options="INCIDENT_MANAGEMENT.CASE_OPTIONS"
					placeholder="Please Select Status Case"
				/>
			</div>
			<n-button @click="handleCreateIncident" type="primary" size="large">
				<template #icon>
					<Icon icon="icons8:plus" />
				</template>
				Create Incident
			</n-button>
		</div>
		<n-data-table
			:row-key="rowKey"
			:columns="column"
			:data="incidentManagementStore.incidents.data"
			@update:checked-row-keys="handleCheck"
		/>
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
		<n-modal v-if="isModalManagement.event === MODAL_TYPE.CREATE" v-model:show="isModalManagement.value">
			<n-card
				:bordered="false"
				aria-modal="false"
				preset="card"
				size="huge"
				:style="{
					width: '1000px'
				}"
				:title="titleModal"
			>
				<template #header-extra>
					<n-button @click="handleCancel" type="tertiary" class="!mr-2">Cancel</n-button>
					<n-button @click="createIncident" type="success">Create</n-button>
				</template>

				<n-form ref="formRef" :model="incidentForm" :rules="rules">
					<n-grid :x-gap="12" cols="1 600:5" item-responsive>
						<n-gi span="2">
							<n-form-item label="Topic" path="topic">
								<n-input
									type="text"
									v-model:value="incidentForm.topic"
									placeholder="Enter Topic"
									size="large"
								/>
							</n-form-item>
						</n-gi>
						<n-gi>
							<n-form-item label="Sentiment Type" path="sentiment_type">
								<n-select
									size="large"
									v-model:value="incidentForm.sentiment_type"
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									:options="INCIDENT_MANAGEMENT.SENTIMENT_TYPE_OPTIONS"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Product" path="brand_id">
								<n-tree-select
									:options="productOption"
									size="large"
									v-model:value="incidentForm.formula_id"
									placeholder="Please Select Product"
									default-expand-all
									show-path
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3">
							<n-form-item label="Page Name" path="page_name">
								<n-input
									type="text"
									v-model:value="incidentForm.page_name"
									placeholder="Enter Page Name"
									size="large"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Link Incident " path="link_incident">
								<n-input
									type="text"
									v-model:value="incidentForm.link_incident"
									placeholder="Enter Link Incident"
									size="large"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3">
							<n-form-item label="Team" path="team_id">
								<n-tree-select
									:options="teamAndBa.team_options"
									size="large"
									v-model:value="selectedCandidates"
									placeholder="Please Select Team"
									multiple
									default-expand-all
									show-path
									@update:value="handleUpdateValue"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Status Incident Case" path="status_incident">
								<n-select
									size="large"
									v-model:value="incidentForm.status_incident"
									:render-label="renderLabelCase"
									:render-tag="renderSelectCase"
									:options="INCIDENT_MANAGEMENT.CASE_OPTIONS"
									disabled
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3">
							<n-form-item label="Social" path="social_id">
								<n-select
									size="large"
									v-model:value="incidentForm.social_id"
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									:options="socialOptions"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 600:2">
							<n-form-item label="BA Type" path="ba_type">
								<n-select
									size="large"
									v-model:value="incidentForm.ba_type"
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									:options="INCIDENT_MANAGEMENT.BA_TYPE_OPTIONS"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 600:3">
							<n-form-item label="Owner Link" path="owner_link">
								<n-input
									size="large"
									v-model:value="incidentForm.owner_link"
									type="text"
									placeholder="Enter Owner Link"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 600:2">
							<n-form-item label="Type Incident Case" path="type_incident_before">
								<n-select
									size="large"
									v-model:value="incidentForm.type_incident_before"
									:render-label="renderLabelTypeFeedback"
									:render-tag="renderSelectTypeFeedback"
									:options="INCIDENT_MANAGEMENT.INCIDENT_TYPE_OPTIONS"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="5">
							<n-form-item label="Type Close Incident Case" path="type_incident_after">
								<n-select
									size="large"
									v-model:value="incidentForm.type_incident_after"
									:render-label="renderLabelTypeFeedback"
									:render-tag="renderSelectTypeFeedback"
									:options="INCIDENT_MANAGEMENT.INCIDENT_TYPE_OPTIONS"
									:disabled="incidentForm.status_incident !== 3"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3">
							<n-form-item label="Description Before" path="description_before">
								<n-input
									size="large"
									v-model:value="incidentForm.description_before"
									type="textarea"
									placeholder="Enter Description Before"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Description After" path="description_after">
								<n-input
									size="large"
									v-model:value="incidentForm.description_after"
									type="textarea"
									placeholder="Enter Description After"
								/>
							</n-form-item>
						</n-gi>
					</n-grid>
				</n-form>
				<div v-for="(items, teamIndex) in incidentForm.candidate" :key="teamIndex">
					<n-card v-if="items.team_id !== 0" class="!rounded-xl !border-[#DADADA] mt-2">
						<n-space class="mb-4" justify="space-between">
							<span class="flex gap-2">
								<h4 class="text-[#2073DE]">Team</h4>
								<n-tag v-if="items.team_id" round type="success" class="!bg-[#2B405B]">
									Team : {{ items.team_name }}
								</n-tag>
							</span>

							<Icon
								class="cursor-pointer"
								@click="deleteTeamWithIndex(teamIndex, false)"
								icon="charm:circle-cross"
								width="24"
								height="24"
								style="color: #fe4c4c"
							/>
						</n-space>

						<n-form
							v-for="(item, index) in items.ba"
							:key="index"
							ref="formRef"
							inline
							:model="incidentForm"
							:rules="rules"
						>
							<n-grid :x-gap="12" cols="2 600:8" item-responsive>
								<n-gi span="2 600:1">
									<n-form-item label="No." path="no_id">
										<n-input
											size="large"
											:value="(index + 1).toString()"
											type="text"
											disabled
											class="!bg-[#E5E7EB]"
										/>
									</n-form-item>
								</n-gi>
								<n-gi span="2 600:4">
									<n-form-item label="Name" path="name">
										<n-input
											size="large"
											v-model:value="item.name"
											type="text"
											placeholder="Enter Name"
										/>
									</n-form-item>
								</n-gi>
								<n-gi span="1 600:2">
									<n-form-item label="Point Case" path="point_case">
										<n-input
											size="large"
											v-model:value="item.point_case"
											type="text"
											disabled
											class="!bg-[#E5E7EB]"
										/>
									</n-form-item>
								</n-gi>
								<n-gi>
									<n-form-item
										class="cursor-pointer"
										@click="deleteBaWithIndex(teamIndex, index, false)"
									>
										<img class="m-auto" src="/images/icon/vector.svg" alt="vector" />
									</n-form-item>
								</n-gi>
							</n-grid>
						</n-form>

						<template #footer>
							<n-button
								@click="handleOpenModalRandom(items.team_id)"
								class="!w-full"
								type="primary"
								size="large"
							>
								<template #icon>
									<Icon icon="icons8:plus" />
								</template>
								Random BA
							</n-button>
						</template>
					</n-card>
				</div>
			</n-card>
		</n-modal>

		<n-modal
			v-if="isModalManagement.event === MODAL_TYPE.VIEW"
			v-model:show="isModalManagement.value"
			aria-modal="false"
			preset="card"
			size="huge"
			:style="{
				width: '800px'
			}"
			:title="titleModal"
			:bordered="false"
		>
			<n-space>
				<n-button
					size="tiny"
					:type="
						incidentForm.type_incident_before === 1
							? 'success'
							: incidentForm.type_incident_before === 3
								? 'error'
								: 'tertiary'
					"
					ghost
					round
				>
					{{ statusIncidentType }}
				</n-button>
				<n-button size="tiny" :type="incidentForm.status_incident !== 3 ? 'info' : 'error'" round>
					{{ statusIncidentCase }}
				</n-button>
			</n-space>
			<n-space class="mt-4 border-b pb-4">
				<Icon icon="mingcute:folder-open-fill" width="24" height="24" color="#092C4D" />
				<h4>{{ incidentForm.topic }}</h4>
			</n-space>
			<n-space class="mt-8" vertical>
				<h4>Link Case</h4>
				<p class="mt-2">Type Link : {{ incidentForm.sentiment_type }}</p>
				<div class="flex gap-4 mt-2 items-center">
					<Icon icon="bx:link" width="24" height="24" color="#4285F4" />
					<a :href="incidentForm.link_incident" class="no-underline">
						{{ incidentForm.link_incident }}
					</a>
				</div>
			</n-space>
			<n-space class="mt-8" vertical>
				<h4>ทีม</h4>
				<p class="mt-2 pl-5">{{ incidentForm.team_name }}</p>
			</n-space>
			<n-space class="mt-8 mb-2" vertical>
				<h4>ยี่ห้อผลิตภัณฑ์ (Product)</h4>
				<p v-for="(item, index) in incidentForm.formulas" :key="index" class="flex flex-col gap-1 pl-5">
					{{ item.brand }}
				</p>
			</n-space>
			<n-space class="mt-8 border-b pb-4" vertical>
				<h4>สูตรนมผง (Formula)</h4>
				<span v-for="(item, index) in incidentForm.formulas" :key="index">
					<ul class="flex flex-col pl-5">
						<li>
							<p>{{ item.formula }}</p>
						</li>
						<p class="text-sm text-[#858C94]">{{ item.description ?? "-" }}</p>
					</ul>
				</span>
			</n-space>
			<n-space class="mt-8" vertical>
				<div class="grid grid-cols-1 md:grid-cols-2 w-[300px] gap-y-4">
					<p class="text-sm text-[#9CA3AF]">Team</p>
					<span class="flex gap-2">
						<p class="whitespace-nowrap truncate max-w-[200px] md:max-w-[300px]">
							{{ incidentForm.team_name }}
						</p>
					</span>

					<div
						class="flex col-span-2"
						v-for="(name, index) in incidentForm?.incidentBrandAdvocacys.filter(
							name => name?.brandAdvocacy?.candidate
						)"
						:key="index"
					>
						<p class="text-sm text-[#9CA3AF]">Assignee BA</p>
						<div class="flex gap-2 ml-[70px]">
							<n-avatar
								class="!w-5 !h-5 rounded-full"
								:style="{
									color: 'white',
									backgroundColor: 'skyblue',
									borderRadius: '100%'
								}"
							>
								{{ name.brandAdvocacy?.candidate.firstname[0] }}
							</n-avatar>
							<p
								class="text-sm text-[#4B5563] font-medium whitespace-nowrap max-w-[200px] md:max-w-[300px]"
							>
								{{ name.brandAdvocacy?.candidate.firstname }}
								{{ name.brandAdvocacy?.candidate.lastname }}
							</p>
						</div>
					</div>
				</div>
			</n-space>
		</n-modal>

		<n-modal v-if="isModalManagement.event === MODAL_TYPE.EDIT" v-model:show="isModalManagement.value">
			<n-card
				:bordered="false"
				aria-modal="false"
				preset="card"
				size="huge"
				:style="{
					width: '1000px'
				}"
				:title="titleModal"
			>
				<template #header-extra>
					<n-button @click="handleCancel" class="!mr-2">Cancel</n-button>
					<n-button type="primary" @click="updateIncident">Save</n-button>
				</template>

				<n-form ref="formRef" :model="incidentForm" :rules="rules">
					<n-grid :x-gap="12" cols="1 600:5" item-responsive>
						<n-gi span="2">
							<n-form-item label="Topic" path="topic">
								<n-input
									type="text"
									v-model:value="incidentForm.topic"
									placeholder="Enter Topic"
									size="large"
								/>
							</n-form-item>
						</n-gi>
						<n-gi>
							<n-form-item label="Sentiment Type" path="sentiment_type">
								<n-select
									size="large"
									v-model:value="incidentForm.sentiment_type"
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									:options="INCIDENT_MANAGEMENT.SENTIMENT_TYPE_OPTIONS"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Product" path="brand_id">
								<n-tree-select
									:options="productOption"
									size="large"
									v-model:value="incidentForm.formula_id"
									placeholder="Please Select Product"
									default-expand-all
									show-path
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3">
							<n-form-item label="Page Name" path="page_name">
								<n-input
									type="text"
									v-model:value="incidentForm.page_name"
									placeholder="Enter Page Name"
									size="large"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Link Incident " path="link_incident">
								<n-input
									type="text"
									v-model:value="incidentForm.link_incident"
									placeholder="Enter Link Incident"
									size="large"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3">
							<n-form-item label="Team" path="team_id">
								<n-tree-select
									:options="teamAndBa.team_options"
									size="large"
									v-model:value="selectedCandidates"
									placeholder="Please Select Team"
									multiple
									default-expand-all
									show-path
									@update:value="handleUpdateValue"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Status Incident Case" path="status_incident">
								<n-select
									size="large"
									v-model:value="incidentForm.status_incident"
									:render-label="renderLabelCase"
									:render-tag="renderSelectCase"
									:options="INCIDENT_MANAGEMENT.CASE_OPTIONS"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3">
							<n-form-item label="Social" path="social_id">
								<n-select
									size="large"
									v-model:value="incidentForm.social_id"
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									:options="socialOptions"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 600:2">
							<n-form-item label="BA Type" path="ba_type">
								<n-select
									size="large"
									v-model:value="incidentForm.ba_type"
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									:options="INCIDENT_MANAGEMENT.BA_TYPE_OPTIONS"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 600:3">
							<n-form-item label="Owner Link" path="owner_link">
								<n-input
									size="large"
									v-model:value="incidentForm.owner_link"
									type="text"
									placeholder="Enter Owner Link"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 600:2">
							<n-form-item label="Type Incident Case" path="type_incident_before">
								<n-select
									size="large"
									v-model:value="incidentForm.type_incident_before"
									:render-label="renderLabelTypeFeedback"
									:render-tag="renderSelectTypeFeedback"
									:options="INCIDENT_MANAGEMENT.INCIDENT_TYPE_OPTIONS"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="5">
							<n-form-item label="Type Close Incident Case" path="type_incident_after">
								<n-select
									size="large"
									v-model:value="incidentForm.type_incident_after"
									:render-label="renderLabelTypeFeedback"
									:render-tag="renderSelectTypeFeedback"
									:options="INCIDENT_MANAGEMENT.INCIDENT_TYPE_OPTIONS"
									:disabled="incidentForm.status_incident !== 3"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3">
							<n-form-item label="Description Before" path="description_before">
								<n-input
									size="large"
									v-model:value="incidentForm.description_before"
									type="textarea"
									placeholder="Enter Description Before"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Description After" path="description_after">
								<n-input
									size="large"
									v-model:value="incidentForm.description_after"
									type="textarea"
									placeholder="Enter Description After"
								/>
							</n-form-item>
						</n-gi>
					</n-grid>
				</n-form>

				<div v-for="(items, teamIndex) in incidentForm.candidate" :key="teamIndex">
					<n-card v-if="items.team_id !== 0" class="!rounded-xl !border-[#DADADA] mt-2">
						<n-space class="mb-4" justify="space-between">
							<span class="flex gap-2">
								<h4 class="text-[#2073DE]">Team</h4>
								<n-tag v-if="items.team_id" round type="success" class="!bg-[#2B405B]">
									Team : {{ items.team_name }}
								</n-tag>
							</span>

							<Icon
								class="cursor-pointer"
								@click="deleteTeamWithIndex(teamIndex, true)"
								icon="charm:circle-cross"
								width="24"
								height="24"
								style="color: #fe4c4c"
							/>
						</n-space>

						<n-form
							v-for="(item, index) in items.ba.filter(item => item.is_delete === 0)"
							:key="index"
							ref="formRef"
							inline
							:model="incidentForm"
							:rules="rules"
						>
							<n-grid :x-gap="12" cols="2 600:8" item-responsive>
								<n-gi span="2 600:1">
									<n-form-item label="No." path="no_id">
										<n-input
											size="large"
											:value="(index + 1).toString()"
											type="text"
											disabled
											class="!bg-[#E5E7EB]"
										/>
									</n-form-item>
								</n-gi>
								<n-gi span="2 600:4">
									<n-form-item label="Name" path="name">
										<n-input
											size="large"
											v-model:value="item.name"
											type="text"
											placeholder="Enter Name"
										/>
									</n-form-item>
								</n-gi>
								<n-gi span="1 600:2">
									<n-form-item label="Point Case" path="point_case">
										<n-input
											size="large"
											v-model:value="item.point_case"
											type="text"
											:disabled="incidentForm.status_incident !== 3"
											:class="` ${incidentForm.status_incident !== 3 ? '!bg-[#E5E7EB]' : ''} `"
										/>
									</n-form-item>
								</n-gi>
								<n-gi>
									<n-form-item
										class="cursor-pointer"
										@click="deleteBaWithIndex(teamIndex, index, true)"
									>
										<img class="m-auto" src="/images/icon/vector.svg" alt="vector" />
									</n-form-item>
								</n-gi>
							</n-grid>
						</n-form>

						<template #footer>
							<n-button
								@click="handleOpenModalRandom(items.team_id)"
								class="!w-full"
								type="primary"
								size="large"
							>
								<template #icon>
									<Icon icon="icons8:plus" />
								</template>
								Random BA
							</n-button>
						</template>
					</n-card>
				</div>
			</n-card>
		</n-modal>

		<n-modal
			v-model:show="isModalManagement.randomModal"
			aria-modal="false"
			preset="card"
			size="huge"
			:style="{
				width: '800px'
			}"
			title="Random BA"
			:bordered="false"
		>
			<n-grid :x-gap="12" cols="1" item-responsive>
				<n-gi>
					<n-form-item label="Number BA" path="amount">
						<n-select
							size="large"
							v-model:value="incidentForm.amount"
							:render-label="renderLabel"
							:render-tag="renderMultipleSelectTag"
							:options="INCIDENT_MANAGEMENT.RANDOM_BA"
						/>
					</n-form-item>
				</n-gi>
				<n-gi>
					<div class="flex justify-between items-end">
						<label for="">Assignee BA</label>
						<n-button @click="handleRandomBa()" size="small" type="error">
							<template #icon>
								<Icon icon="flowbite:refresh-outline" width="24" height="24" style="color: #fff" />
							</template>
							Regenerate
						</n-button>
					</div>
					<n-form-item path="all_ba" class="-mt-4">
						<n-select
							id="selection-multiple"
							size="large"
							v-model:value="incidentForm.all_ba"
							:render-label="renderLabel"
							:render-tag="renderMultipleSelectTagPoint"
							:options="randomBaOptions"
							multiple
							disabled
						/>
					</n-form-item>
				</n-gi>
			</n-grid>
		</n-modal>
	</div>
</template>

<script lang="ts">
import { defineComponent, h, reactive, ref, computed, onMounted, watch } from "vue"
import {
	NDataTable,
	NModal,
	NSelect,
	NPagination,
	NSpace,
	NInput,
	NButton,
	NForm,
	NFormItem,
	NGrid,
	NGi,
	NTag,
	NCard,
	NTreeSelect,
	NAvatar
} from "naive-ui"
import { Icon } from "@iconify/vue"
import { useTeamManagementStore } from "@/stores/useTeamManagementStore"
import { useMasterDataStore } from "@/stores/useMasterDataStore"
import { useIncidentManagementStore } from "@/stores/useIncidentManagement"
import {
	renderMultipleSelectTag,
	renderMultipleSelectTagPoint,
	renderSelectTypeFeedback,
	renderLabelTypeFeedback,
	renderLabel,
	renderSelectCase,
	renderLabelCase
} from "@/components/common/SelectNaiveStyle"

import type { DataTableColumns, DataTableRowKey, TreeSelectOverrideNodeClickBehavior, TreeSelectOption } from "naive-ui"
import { PAGE_SIZES, INCIDENT_MANAGEMENT } from "@/components/utils/constants"
import { MODAL_TYPE } from "@/views/UserManagement/User/index.vue"
import type { FormInst, FormRules } from "naive-ui"
import { toRaw } from "vue"
import { useRouter } from "vue-router"
import _ from "lodash"
interface RowData {
	id: number
	key?: number
	feedback: string
	typeFeedback: string
	name: string
	status: string
	reporter: { firstName: string; lastName: string }
	incidentBrandAdvocacys: {
		team: { id: number; name: string }
		brandAdvocacy: { candidate: { firstname: string; lastname: string }; team: { name: string } }
	}[]
	sentiment_type: string
	team_id: number
	status_incident: number
	topic: string
	type_incident_before: number
	formula: { formula: { brand: { name: string }; name: string; description: string }[] }[]
	description_before: string
	description_after: string
	owner_link: string
}

export default defineComponent({
	name: "IncidentManagement",
	components: {
		NDataTable,
		NModal,
		NPagination,
		NSpace,
		NInput,
		NButton,
		NForm,
		NFormItem,
		NGrid,
		NGi,
		NTag,
		NSelect,
		NTreeSelect,
		NCard,
		NAvatar,
		Icon
	},
	setup() {
		const teamManagementStore = useTeamManagementStore()
		const masterDataStore = useMasterDataStore()
		const incidentManagementStore = useIncidentManagementStore()
		const router = useRouter()
		const showModalRef = ref(false)
		const checkedRowKeysRef = ref<DataTableRowKey[]>([])
		const formRef = ref<FormInst | null>(null)
		const brands = ref<any>([])
		const brandOption = computed(() =>
			brands.value.map((brand: any) => ({
				label: brand.name,
				value: brand.id
			}))
		)
		const teamAndBa = reactive({
			team: [
				{
					label: "Team 1",
					key: null,
					children: [
						{
							label: "BA 1",
							key: null
						}
					]
				}
			],
			team_options: []
		})
		const randomBaOptions = ref<any>([])
		const socialOptions = ref<any>([])
		const productOption = computed(() =>
			brands.value.map((brand: any) => ({
				label: brand.name,
				key: brand.id,
				children: brand.formulas.map((formula: any) => ({
					label: formula.name,
					brand_id: brand.id,
					key: `${brand.id}_${formula.id}`,
					description: formula.description
				}))
			}))
		)

		const teamOptions = ref<any>([])
		const defaultValue = {
			id: 0,
			topic: "",
			sentiment_type: "Post",
			brand_id: 0,
			formula_id: "",
			page_name: "",
			link_incident: "",
			team_id: 0,
			status_incident: 1,
			social_id: 1,
			ba_type: "ba_mom",
			owner_link: "",
			type_incident_before: 1,
			type_incident_after: 2,
			description_before: "",
			description_after: "",
			team: { team: { name: "" } },
			formulas: [{ brand: "", formula: "", description: "" }],
			incidentBrandAdvocacys: [
				{ brandAdvocacy: { candidate: { firstname: "", lastname: "" } } },
				{ team_id: null, team: { name: "" }, point: "0" },
				{ team: { name: "" } }
			],
			ba_id: null,
			candidate: [
				{
					team_id: 0,
					team_name: "",
					ba: [
						{
							name: "",
							point_case: "",
							brand_advocacy_id: 0,
							is_active: 1,
							is_delete: 0
						}
					]
				}
			],
			amount: 1,
			team_name: "",
			all_ba: []
		}
		const incidentForm = reactive({ ...defaultValue })
		const isModalManagement = reactive({
			value: false,
			event: MODAL_TYPE.VIEW,
			randomModal: false
		})
		const titleModal = computed(() => {
			switch (isModalManagement.event) {
				case MODAL_TYPE.CREATE:
					return "Create Incident"
				case MODAL_TYPE.VIEW:
					return "Detail Incident Case"
				case MODAL_TYPE.EDIT:
					return "Edit Incident"
				case MODAL_TYPE.RANDOM:
					return "Random BA"
				default:
					return ""
			}
		})
		function createColumns(): DataTableColumns<RowData> {
			return [
				{
					title: "No.",
					key: "no",
					width: "50px",
					className: "!text-center max-w-[50px]",
					render(row, index) {
						return h("div", pagination.limit * (pagination.page - 1) + index + 1)
					}
				},
				{
					title: "Feedback Title",
					key: "feedback",
					width: "200px",
					className: "max-w-[200px] whitespace-nowrap truncate",
					render(row) {
						return h("div", row.topic)
					}
				},
				{
					title: "Sentiment Type",
					key: "sentiment_type",
					width: "120px",
					className: "max-w-[100px] !text-center whitespace-nowrap truncate text-[#2B405B]",
					render(row) {
						return h("div", row.sentiment_type)
					}
				},
				{
					title: "Type Feedback",
					key: "feedback",
					width: "150px",
					className: "max-w-[150px] !text-center font-medium whitespace-nowrap truncate",
					render(row) {
						return h(
							"div",
							{
								className: `${row.type_incident_before === 1 ? "text-[#209788]" : row.type_incident_before === 3 ? "text-[#FF6D83]" : "text-[#2B405B]"}`
							},
							row.type_incident_before === 1
								? "Positive"
								: row.type_incident_before === 3
									? "Negative"
									: "Neutral"
						)
					}
				},
				{
					title: "Team",
					key: "team",
					width: "200px",
					className: "!text-center max-w-[200px] ",
					render(row) {
						const teamNames = Array.from(
							new Set(
								row.incidentBrandAdvocacys
									.map((team: { team: { name: string } }) => team?.team?.name)
									.filter(name => name !== undefined)
							)
						).join(", ")
						return h("div", teamNames || "-")
					}
				},
				{
					title: "Status Case",
					key: "status",
					width: "160px",
					className: "!text-center max-w-[160px]",
					render(row) {
						return h(NSelect, {
							options: INCIDENT_MANAGEMENT.CASE_OPTIONS,
							"v-model:value": row.status_incident,
							value: row.status_incident,
							renderLabel: renderLabelCase,
							renderTag: renderSelectCase,
							onUpdateValue: async (value: number) => {
								row.status_incident = value
								const body = {
									incident_id: row.id,
									status_incident: value
								}
								await incidentManagementStore.updateIncident(body)
							}
						})
					}
				},
				{
					title: "Owner BA ",
					key: "owner_link",
					width: "250px",
					className: "max-w-[200px] !text-center",
					render(row) {
						return h("div", { class: "space-y-2" }, row.owner_link)
					}
				},
				{
					title: "Action",
					className: "!text-center",
					key: "action",
					width: "100px",
					render(row) {
						return h("div", { class: "flex gap-x-6 justify-center items-center" }, [
							h(Icon, {
								icon: "mdi:eye-outline",
								class: "w-6 h-6 cursor-pointer",
								onClick: async (e: MouseEvent) => {
									e.preventDefault()
									await incidentManagementStore.getIncidentById(row.id)

									const teamNames = Array.from(
										new Set(
											incidentManagementStore.incident.incidentBrandAdvocacys
												.map((team: { team: { name: string } }) => team?.team?.name)
												.filter(name => name !== undefined)
										)
									).join(" ")
									const formula = Array.from(
										new Set(
											toRaw(incidentManagementStore.incident.incidentBrandAdvocacys || [])
												.flatMap(
													(brand: any) =>
														brand.brandAdvocacy?.candidate?.candidateFormulas || []
												)
												.map((formula: any) =>
													JSON.stringify({
														formula: formula.formula.name,
														brand: formula.formula.brand.name,
														description: formula.formula.description
													})
												)
										)
									).map((str: string) => JSON.parse(str))
									Object.assign(incidentForm, incidentManagementStore.incident, {
										team_name: teamNames,
										formulas: formula
									})
									isModalManagement.value = true
									isModalManagement.event = MODAL_TYPE.VIEW
								}
							}),
							h(Icon, {
								icon: "icon-park-outline:view-grid-detail",
								class: "w-6 h-6 cursor-pointer",
								onClick: async () => {
									router.push("/incident-management/payment-detail")
								}
							}),
							h(Icon, {
								icon: "flowbite:edit-outline",
								class: "w-6 h-6 cursor-pointer",
								onClick: async () => {
									await incidentManagementStore.getIncidentById(row.id)
									const candidate = incidentManagementStore.incident.incidentBrandAdvocacys.reduce(
										(acc: any, brand: any) => {
											const teamIndex = acc.findIndex(
												(team: any) => team.team_id === brand.team.id
											)
											const candidateData = brand?.brandAdvocacy?.candidate || {}
											const baData = {
												name: `${candidateData.firstname || ""} ${candidateData.lastname || ""}`,
												point_case: brand.point,
												brand_advocacy_id: brand.brand_advocacy_id,
												is_active: candidateData.is_active,
												is_delete: candidateData.is_delete
											}

											if (teamIndex === -1) {
												acc.push({
													team_id: brand.team.id,
													team_name: brand.team.name,
													ba: [baData]
												})
											} else {
												acc[teamIndex].ba.push(baData)
											}

											return acc
										},
										[]
									)
									Object.assign(incidentForm, incidentManagementStore.incident, {
										formula: toRaw(incidentManagementStore.incident.incidentBrandAdvocacys).flatMap(
											(brand: any) => brand?.brandAdvocacy?.candidate?.candidateFormulas
										),
										team_id: incidentManagementStore.incident.incidentBrandAdvocacys[0].team.id,
										candidate: candidate,
										formula_id: `${incidentManagementStore.incident.brand_id}_${incidentManagementStore.incident.formula_id}`
									})
									selectedCandidates.value = incidentForm.candidate.flatMap((team: any) => {
										return [
											team.team_id,
											...team.ba.map((ba: any) => `${team.team_id}_${ba.brand_advocacy_id}`)
										]
									})
									isModalManagement.value = true
									isModalManagement.event = MODAL_TYPE.EDIT
								}
							})
						])
					}
				}
			]
		}
		const column = createColumns()
		const pagination = reactive({
			page: 1,
			limit: 10
		})
		const filterApi = reactive({
			filter: "",
			feedback_type: "",
			status_case: ""
		})
		const paginateCount = computed(() => {
			const countPage = pagination.limit * pagination.page
			const totalTeams = incidentManagementStore?.incidents?.total ?? 0
			return countPage > totalTeams ? totalTeams : countPage
		})
		const itemCount = computed(() => {
			return incidentManagementStore?.incidents?.total || 0
		})
		const rules: FormRules = {}

		onMounted(async () => {
			await masterDataStore.getBrands()
			await masterDataStore.getSocial()
			await incidentManagementStore.getIncidents({ ...pagination, ...filterApi })
			await incidentManagementStore.getTeamAndBa()
			Object.assign(teamAndBa, {
				team_options: incidentManagementStore.teamAndBa.map((team: any) => ({
					label: team.name,
					key: team.id,
					children: team?.teamBrandAdvocacy
						?.filter(
							(ba: any) =>
								ba.brandAdvocacy?.candidate?.firstname &&
								ba.brandAdvocacy?.candidate?.lastname &&
								ba.brandAdvocacy?.candidate?.id &&
								ba.brandAdvocacy?.candidate?.is_active === 1 &&
								ba.brandAdvocacy?.candidate?.is_delete === 0
						)
						.map((ba: any) => ({
							label: ba.brandAdvocacy?.candidate?.firstname + " " + ba.brandAdvocacy?.candidate?.lastname,
							key: team.id + "_" + ba?.brand_advocacy_id,
							team_id: team.id,
							team_name: team.name,
							is_active: ba.brandAdvocacy?.candidate?.is_active,
							is_delete: ba.brandAdvocacy?.candidate?.is_delete
						}))
				}))
			})

			brands.value = masterDataStore.brands
			socialOptions.value = masterDataStore.social.map(
				(social: { id: number; name: string; is_active: number; is_delete: number }) => ({
					value: social.id,
					label: social.name,
					is_active: social.is_active,
					is_delete: social.is_delete
				})
			)
			await teamManagementStore.getTeamAllEditBA()
			teamOptions.value = teamManagementStore.teamAllBA.data.map(
				(team: { id: number; name: string; is_active: number; is_delete: number }) => ({
					value: team.id,
					label: team.name,
					is_active: team.is_active,
					is_delete: team.is_delete
				})
			)
		})

		function handleCreateIncident(e: MouseEvent) {
			e.preventDefault()
			Object.assign(incidentForm, defaultValue)
			selectedCandidates.value = []
			isModalManagement.value = true
			isModalManagement.event = MODAL_TYPE.CREATE
		}
		function getTeamName(teamId: number) {
			const team = teamOptions.value.find((team: { value: number }) => team.value === teamId)
			return team ? team.label : ""
		}
		const override: TreeSelectOverrideNodeClickBehavior = ({ option }) => {
			if (option.children) {
				return "toggleExpand"
			}
			return "default"
		}

		const statusIncidentCase = computed(() => {
			const statusOption = INCIDENT_MANAGEMENT.CASE_OPTIONS.find(
				option => option.value === incidentForm.status_incident
			)
			return statusOption ? statusOption.label : "Unknown Status"
		})
		const statusIncidentType = computed(() => {
			const statusOption = INCIDENT_MANAGEMENT.INCIDENT_TYPE_OPTIONS.find(
				option => option.value === incidentForm.type_incident_before
			)
			return statusOption ? statusOption.label : "Unknown Status"
		})
		// Logic N-tree-select start
		const selectedCandidates = ref<(string | number)[]>([])
		function handleUpdateValue(
			value: Array<string | number | { id: number; name: string; point_case: number; team_id: number }>,
			option: TreeSelectOption | null | Array<TreeSelectOption | null>
		): void {
			if (option) {
				const mappingData = (option as TreeSelectOption[])
					.filter((item: any) => item !== null)
					.reduce((acc: any, item: any) => {
						if (item.children && Array.isArray(item.children)) {
							const existingTeamIndex = acc.findIndex(
								(team: any) => team.team_id === item.key && team.team_name === item.label
							)
							if (existingTeamIndex === -1) {
								acc.push({
									team_id: item.key,
									team_name: item.label,
									ba: []
								})
							}
						} else {
							const teamIndex = acc.findIndex((team: any) => team.team_id === item.team_id)
							const baData = {
								brand_advocacy_id: item.key,
								name: item.label,
								point_case: 0,
								is_active: item.is_active,
								is_delete: item.is_delete
							}
							if (teamIndex !== -1) {
								if (acc[teamIndex].ba !== undefined) {
									acc[teamIndex].ba.push(baData)
								} else {
									acc[teamIndex].ba = [baData]
								}
							} else {
								acc.push({
									team_id: item.team_id,
									team_name: item.team_name,
									ba: [baData]
								})
							}
						}
						return acc
					}, [])
				Object.assign(incidentForm, {
					candidate: mappingData
				})
			}
		}
		function updateFormula(value: string | number | Array<string | number> | null): void {
			if (typeof value === "string" && value.includes("_")) {
				const selectedOption = productOption.value
					.flatMap((option: any) => option.children || [])
					.find((child: any) => child.key === value)
				if (selectedOption) {
					incidentForm.brand_id = selectedOption.brand_id
				}
			} else if (typeof value === "number") {
				const selectedOption = productOption.value.find((option: any) => option.key === value)
				if (selectedOption) {
					incidentForm.brand_id = selectedOption.key
				}
			}
		}
		// Logic N-tree-select end
		async function createIncident() {
			const splitFormula = incidentForm.formula_id.toString().split("_")
			const body = {
				topic: incidentForm.topic,
				sentiment_type: incidentForm.sentiment_type,
				brand_id: Number(splitFormula[0]),
				formula_id: Number(splitFormula[1]),
				page_name: incidentForm.page_name,
				link_incident: incidentForm.link_incident,
				status_incident: incidentForm.status_incident,
				social_id: incidentForm.social_id,
				ba_type: incidentForm.ba_type,
				owner_link: incidentForm.owner_link,
				type_incident_before: incidentForm.type_incident_before,
				type_incident_after: incidentForm.type_incident_after,
				description_before: incidentForm.description_before,
				description_after: incidentForm.description_after,
				ba: incidentForm.candidate.flatMap((team: any) =>
					team.ba.map((ba: any) => {
						const brandAdvocacyId = ba.brand_advocacy_id.toString().split("_")
						return {
							team_id: team.team_id,
							// eslint-disable-next-line no-constant-condition
							brand_advocacy_id: typeof Array ? Number(brandAdvocacyId[1]) : ba.brand_advocacy_id
						}
					})
				)
			}
			await incidentManagementStore.createIncident(body)
			await incidentManagementStore.getIncidents({ ...pagination, ...filterApi })
			isModalManagement.value = false
		}
		async function handleRandomBa() {
			const params = {
				team_id: incidentForm.team_id,
				amount: incidentForm.amount
			}

			await incidentManagementStore.getRandomBa(params)
			const candidate = incidentManagementStore.ba.reduce(
				(acc: any, ba: any) => {
					const index = acc.findIndex((ac: any) => ac.team_id === incidentForm.team_id)
					const baData = {
						name: ba.firstname + " " + ba.lastname,
						totalJob: ba.totalJob,
						point_case: 0,
						brand_advocacy_id: ba.brand_advocacy_id
					}
					Object.assign(incidentForm, {
						candidate: incidentForm.candidate.map(
							(ba: any) => acc[index].team_id === ba.team_id && (ba.ba = [])
						)
					})

					acc.map((ac: any) => ac.team_id === incidentForm.team_id && ac.ba.push(baData))
					return acc
				},
				[...incidentForm.candidate]
			)
			Object.assign(incidentForm, {
				all_ba: incidentManagementStore.ba.map((ba: any) => ba.brand_advocacy_id),
				candidate: candidate,
				amount: 1
			})
			randomBaOptions.value = incidentManagementStore.ba.map((ba: any) => ({
				label: ba.firstname + " " + ba.lastname,
				value: ba.brand_advocacy_id,
				totalJob: ba.totalJob
			}))
		}
		async function updateIncident() {
			const splitFormula = incidentForm.formula_id.toString().split("_")
			const body = {
				incident_id: incidentForm.id,
				topic: incidentForm.topic,
				sentiment_type: incidentForm.sentiment_type,
				brand_id: Number(splitFormula[0]),
				formula_id: Number(splitFormula[1]),
				page_name: incidentForm.page_name,
				link_incident: incidentForm.link_incident,
				status_incident: incidentForm.status_incident,
				social_id: incidentForm.social_id,
				ba_type: incidentForm.ba_type,
				owner_link: incidentForm.owner_link,
				type_incident_before: incidentForm.type_incident_before,
				type_incident_after: incidentForm.type_incident_after,
				description_before: incidentForm.description_before,
				description_after: incidentForm.description_after,
				ba: incidentForm.candidate.flatMap((team: any) =>
					team.ba
						.filter((ba: any) => ba.brand_advocacy_id)
						.map((ba: any) => {
							const brandAdvocacyId = ba.brand_advocacy_id.toString().split("_")
							return {
								team_id: team.team_id,
								brand_advocacy_id:
									brandAdvocacyId.length > 1 ? Number(brandAdvocacyId[1]) : ba.brand_advocacy_id,
								is_active: ba.is_active,
								is_delete: ba.is_delete,
								point: Number(ba.point_case)
							}
						})
				)
			}
			await incidentManagementStore.updateIncident(body)
			await incidentManagementStore.getIncidents({ ...pagination, ...filterApi })
			isModalManagement.value = false
		}
		function handleCancel() {
			Object.assign(incidentForm, defaultValue)
			isModalManagement.value = false
		}
		function handleOpenModalRandom(teamId: number) {
			Object.assign(incidentForm, {
				team_id: teamId,
				all_ba: []
			})
			isModalManagement.randomModal = true
		}
		function deleteBaWithIndex(teamIndex: number, baIndex: number, checkActive: boolean) {
			if (checkActive) {
				incidentForm.candidate[teamIndex].ba[baIndex].is_active = 0
				incidentForm.candidate[teamIndex].ba[baIndex].is_delete = 1
				selectedCandidates.value = incidentForm.candidate.flatMap((team: any) => {
					return [team.team_id, ...team.ba.map((ba: any) => `${ba.brand_advocacy_id}`)]
				})
			} else if (incidentForm.candidate[teamIndex] && incidentForm.candidate[teamIndex].ba) {
				incidentForm.candidate[teamIndex].ba.splice(baIndex, 1)

				selectedCandidates.value = incidentForm.candidate.flatMap((team: any) => {
					return [team.team_id, ...team.ba.map((ba: any) => `${ba.brand_advocacy_id}`)]
				})
			} else {
				console.error("Invalid teamIndex or baIndex")
			}
		}
		function deleteTeamWithIndex(teamIndex: number, checkActive: boolean) {
			if (checkActive) {
				incidentForm.candidate[teamIndex].ba.map((ba: any) => {
					(ba.is_active = 0), (ba.is_delete = 1)
				})
				selectedCandidates.value = incidentForm.candidate.flatMap((team: any) => {
					return [team.team_id, ...team.ba.map((ba: any) => `${ba.brand_advocacy_id}`)]
				})
			} else if (incidentForm.candidate[teamIndex]) {
				incidentForm.candidate.splice(teamIndex, 1)
				selectedCandidates.value = incidentForm.candidate.flatMap((team: any) => {
					return [team.team_id, ...team.ba.map((ba: any) => `${team.team_id}_${ba.brand_advocacy_id}`)]
				})
			} else {
				console.error("Invalid teamIndex")
			}
		}

		const handleSearch = _.debounce((value: string, type: string) => {
			if (type === "input") {
				filterApi.filter = value
			} else if (type === "feedback_type") {
				filterApi.feedback_type = value
			} else if (type === "status_case") {
				filterApi.status_case = value
			}
		}, 500)
		watch(filterApi, async value => {
			pagination.page = 1
			/// Call API
			await incidentManagementStore.getIncidents({ ...pagination, ...value })
		})
		return {
			showModalRef,
			checkedRowKeysRef,
			rowKey: (row: RowData) => row.name,
			handleCheck(rowKeys: DataTableRowKey[]) {
				checkedRowKeysRef.value = rowKeys
			},
			column,
			PAGE_SIZES,
			pagination,
			paginateCount,
			itemCount,
			incidentForm,
			isModalManagement,
			titleModal,
			MODAL_TYPE,
			formRef,
			rules,
			handleCreateIncident,
			INCIDENT_MANAGEMENT,
			renderMultipleSelectTag,
			renderLabel,
			brandOption,
			productOption,
			teamOptions,
			override,
			socialOptions,
			getTeamName,
			incidentManagementStore,
			statusIncidentCase,
			statusIncidentType,
			teamAndBa,
			handleUpdateValue,
			createIncident,
			selectedCandidates,
			renderMultipleSelectTagPoint,
			handleOpenModalRandom,
			handleRandomBa,
			randomBaOptions,
			handleCancel,
			updateFormula,
			renderSelectTypeFeedback,
			renderLabelTypeFeedback,
			renderLabelCase,
			renderSelectCase,
			updateIncident,
			deleteBaWithIndex,
			deleteTeamWithIndex,
			handleSearch
		}
	}
})
</script>
<style scoped>
h4 {
	@apply text-[#2B405B];
}
.n-base-select-menu .n-base-select-option .n-base-select-option__content {
	width: 100%;
}

#selection-multiple .n-base-close.n-base-close--absolute {
	left: 10px;
}
</style>
