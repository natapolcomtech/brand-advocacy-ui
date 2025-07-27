<template>
	<div>
		<h1>Candidate</h1>
		<div class="mb-6 mt-4 flex flex-col w-full gap-4">
			<div class="flex flex-col md:flex-row gap-4">
				<n-input
					type="text"
					placeholder="Search Candidate Name , Telephone "
					size="large"
					class="md:!w-[535px]"
					:on-update:value="handleSearch"
				>
					<template #suffix>
						<Icon icon="majesticons:search-line" style="color: #d1d1d1" width="24" />
					</template>
				</n-input>
				<n-select
					:options="TELEPHONE_OPTIONS"
					v-model:value="filterApi.telephone_status"
					:render-label="renderLabel"
					:render-tag="renderMultipleSelectTag"
					class="md:!w-[260px]"
					size="large"
					placeholder="Select Telephone Status"
					clearable
				/>
				<n-select
					:options="MOCK_OPTIONS_SMS"
					:render-label="renderLabel"
					:render-tag="renderMultipleSelectTag"
					v-model:value="filterApi.sms_status"
					placeholder="Select SMS Status"
					class="md:!w-[260px]"
					size="large"
					clearable
				/>
			</div>
			<n-space class="!flex !flex-col md:!flex-row !gap-4">
			<n-date-picker
				v-model:value="filterApi.date"
				type="datetimerange"
				clearable
				size="large"
				class="md:!w-[535px]"
			/>
			<n-select
					:options="teamOptions"
					v-model:value="filterApi.line_group_id"
					:render-label="renderLabel"
					:render-tag="renderMultipleSelectTag"
					class="md:!w-[260px]"
					size="large"
					placeholder="Select Line Group"
					clearable
				/>
			</n-space>
		</div>
		<div class="rounded-t-xl bg-[#EAF4FF] w-full py-4 pl-12 pr-6 md:flex justify-between">
			<span class="flex items-center font-semibold truncate">
				<p class="text-[#2B405B]">รายการ Candidate ที่ได้รับการเลือก</p>
				<p class="text-[#4285F4] ml-2">{{ checkedRowKeysRef.length }} รายการ</p>
			</span>
			<n-space
				v-if="checkPermission(['ba-manage-all', 'ba-candidate-review-all', 'ba-candidate-review-brand'])"
				class="md:!flex !justify-end mt-4 md:mt-0"
			>
				<n-button @click="randomReview" type="error">RANDOM REVIEW</n-button>
				<n-button @click="reviewAll" v-if="checkedRowKeysRef.length > 0" type="primary">REVIEW ALL</n-button>
			</n-space>
		</div>
		<n-data-table :columns="column" :data="candidateBAStore.candidates.data" scroll-x-auto />
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
			v-if="isModalManagement.event === MODAL_TYPE.VIEW"
			v-model:show="isModalManagement.value"
			:bordered="false"
			aria-modal="false"
			preset="card"
			size="huge"
			:style="{
				width: '800px'
			}"
			:title="titleModal"
		>
			<div class="bg-[#FFD984] rounded-xl py-4 px-6 md:flex gap-x-6">
				<div class="flex md:inline-block justify-center items-center mb-4 md:mb-0">
					<n-avatar
						:size="130"
						:style="{
							backgroundColor: 'Azure'
						}"
					>
						<p class="text-3xl">{{ candidateDetail.firstname[0].toUpperCase() }}</p>
					</n-avatar>
				</div>
				<div>
					<h2 class="mb-4 text-2xl font-semibold text-[#2E3C52]">
						{{ candidateDetail.firstname }} {{ candidateDetail.lastname }}
					</h2>

					<div class="flex flex-col gap-1">
						<span class="md:flex">
							<p class="md:w-40 font-bold">Facebook</p>
							<p class="truncate">: {{ candidateDetail.facebook }}</p>
						</span>
						<span class="md:flex">
							<p class="md:w-40 font-bold">Line ID</p>
							<p class="truncate">: {{ candidateDetail.line }}</p>
						</span>
						<span class="md:flex">
							<p class="md:w-40 font-bold">Email</p>
							<p class="truncate">: {{ candidateDetail.email }}</p>
						</span>
						<span class="md:flex">
							<p class="md:w-40 font-bold">Phone</p>
							<p class="truncate">: {{ candidateDetail.telephone }}</p>
						</span>
					</div>
					<n-space class="my-4">
						<n-button
							:type="
								candidateDetail.is_contactable_telephone !== 1 &&
								candidateDetail.is_contactable_telephone !== 0 &&
								candidateDetail.is_contactable_telephone <= 5
									? 'info'
									: 'error'
							"
							round
							size="small"
						>
							{{
								TELEPHONE_OPTIONS.find(
									option => option.value === candidateDetail?.is_contactable_telephone
								)?.label
							}}
						</n-button>
						<n-button
							:type="candidateDetail.is_contactable_sms === 1 ? 'info' : 'error'"
							round
							size="small"
						>
							{{
								`${candidateDetail.is_contactable_sms === 1 ? "Is SMS Contactable" : "Unable to contactable via SMS"}`
							}}
						</n-button>
					</n-space>
					<span v-if="candidateDetail.remark" class="md:flex mt-4">
						<p class="md:w-40 font-bold text-red-500">Remark</p>
						<p class=" ">: {{ candidateDetail.remark }}</p>
					</span>
				</div>
			</div>
			<n-card size="medium" class="mt-4 !rounded-xl !border-[#D1D5DB]">
				<n-space vertical>
					<h4 class="mb-2 font-semibold text-[#2073DE]">ข้อมูลแม่</h4>
					<div class="flex flex-col gap-1 pl-5">
						<span class="flex">
							<p class="md:w-40 font-bold">ชื่อ</p>
							<p class="truncate">{{ `: ${candidateDetail.firstname} ${candidateDetail.lastname}` }}</p>
						</span>
						<span class="flex">
							<p class="md:w-40 font-bold">ชื่อเล่น</p>
							<p class="truncate">{{ `: ${candidateDetail.nickname} ` }}</p>
						</span>
						<span class="flex">
							<p class="md:w-40 font-bold">อายุ</p>
							<p>{{ `: ${calculateAge(candidateDetail.birthdate)}` }}</p>
						</span>
						<span class="flex">
							<p class="md:w-40 font-bold">อาชีพ</p>
							<p>{{ `: ${candidateDetail.occupation}` }}</p>
						</span>
						<span class="flex">
							<p class="md:w-40 font-bold">ที่อยู่</p>
							<p>{{ `: ${candidateDetail.address ?? "-"}` }}</p>
						</span>
						<span class="flex">
							<p class="md:w-40 font-bold">บุตร</p>
							<p>{{ `: ${candidateDetail.childrens.length} คน` }}</p>
						</span>
					</div>
				</n-space>
				<n-space v-show="candidateDetail.childrens.length > 0" vertical class="mt-4">
					<h4 class="mb-2 font-semibold text-[#2073DE]">ข้อมูลลูก</h4>
					<div
						v-for="child in candidateDetail.childrens"
						:key="child.id"
						:class="`flex flex-col gap-1 pl-5  ${candidateDetail.childrens.length > 1 ? 'border-b  pb-2' : 'mb-2 '}`"
					>
						<span class="flex">
							<p class="md:w-40 font-bold">ชื่อ</p>
							<p class="truncate">{{ `: ${child.firstname} ${child.lastname}` }}</p>
						</span>
						<span class="flex">
							<p class="md:w-40 font-bold">เพศ</p>
							<p>{{ `: ${child.gender === "M" ? "ชาย" : "หญิง"}` }}</p>
						</span>
						<span class="flex">
							<p class="md:w-40 font-bold">อายุ</p>
							<p>{{ `: ${calculateAge(child.birthdate)}` }}</p>
						</span>
					</div>
				</n-space>
				<n-space vertical class="mt-4">
					<h4 class="mb-2 font-semibold text-[#2073DE] truncate">ยี่ห้อผลิตภัณฑ์ (Product) :</h4>
					<div v-if="candidateDetail.candidateFormulas.length > 0">
						<span class="flex">
							<p
								v-for="(item, index) in candidateDetail.candidateFormulas"
								:key="index"
								class="flex flex-col gap-1 pl-5"
							>
								{{ getBrandName(item.formula_id) ?? "-" }}
							</p>
						</span>
					</div>
					<div v-else class="pl-5">-</div>
				</n-space>
				<n-space vertical class="mt-4">
					<h4 class="mb-2 font-semibold text-[#2073DE] truncate">สูตรนมผง (Formula) :</h4>
					<div v-if="candidateDetail.candidateFormulas.length > 0">
						<span v-for="(item, index) in candidateDetail.candidateFormulas" :key="index">
							<ul class="flex flex-col pl-5">
								<li>
									<p>{{ item.formula.name }}</p>
								</li>
								<p class="text-sm text-[#858C94]">{{ item.formula.description ?? "-" }}</p>
							</ul>
						</span>
					</div>
					<div v-else class="pl-5">-</div>
				</n-space>
			</n-card>
		</n-modal>

		<n-modal
			v-if="isModalManagement.event === MODAL_TYPE.EDIT"
			v-model:show="isModalManagement.value"
			:bordered="false"
			aria-modal="false"
			preset="card"
			size="huge"
			:style="{
				width: '900px'
			}"
			:title="titleModal"
		>
			<n-form ref="formRefCandidate" :model="dataCandidate" :rules="rules">
				<h4 class="mb-4 font-medium text-[#2073DE]">ข้อมูลแม่</h4>
				<n-grid :x-gap="12" cols="1 600:2" item-responsive>
					<n-gi>
						<n-form-item label="First Name" path="firstname">
							<n-input
								type="text"
								v-model:value="dataCandidate.firstname"
								placeholder="Enter First Name"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Last Name" path="lastname">
							<n-input
								type="text"
								v-model:value="dataCandidate.lastname"
								placeholder="Enter Last Name"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Call Date" path="call_date">
							<n-date-picker
								size="large"
								v-model:value="dataCandidate.call_date"
								type="date"
								class="w-full"
								format="dd/MM/yyyy"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Birth date" path="birthdate">
							<n-date-picker
								size="large"
								v-model:value="dataCandidate.birthdate"
								type="date"
								class="w-full"
								format="dd/MM/yyyy"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Gender" path="gender">
							<n-select
								size="large"
								v-model:value="dataCandidate.gender"
								:render-label="renderLabel"
								:render-tag="renderMultipleSelectTag"
								:options="GENDER_OPTIONS"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Line Group" path="line_group_id">
							<n-select
								:options="teamOptions"
								v-model:value="dataCandidate.line_group_id"
								:render-label="renderLabel"
								:render-tag="renderMultipleSelectTag"
								class="!w-full"
								size="large"
								filterable
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Facebook" path="facebook">
							<n-input
								type="text"
								v-model:value="dataCandidate.facebook"
								placeholder="Enter Facebook"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Line" path="line">
							<n-input
								type="text"
								v-model:value="dataCandidate.line"
								placeholder="Enter Line"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Email" path="email">
							<n-input
								type="text"
								v-model:value="dataCandidate.email"
								placeholder="Enter Email"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Telephone" path="telephone">
							<n-input
								type="text"
								v-model:value="dataCandidate.telephone"
								placeholder="Enter Telephone"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Is Telephone Contactable" path="is_contactable_telephone">
							<n-select
								:options="TELEPHONE_OPTIONS"
								v-model:value="dataCandidate.is_contactable_telephone"
								:render-label="renderLabel"
								:render-tag="renderMultipleSelectTag"
								class="!w-full"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Is SMS Contactable" path="is_contactable_sms">
							<n-select
								:options="MOCK_OPTIONS_SMS"
								:render-label="renderLabel"
								:render-tag="renderMultipleSelectTag"
								v-model:value="dataCandidate.is_contactable_sms"
								class="!w-full"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Remark" path="remark">
							<n-input
								type="textarea"
								v-model:value="dataCandidate.remark"
								placeholder="Enter Address"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Address" path="address">
							<n-input
								type="textarea"
								v-model:value="dataCandidate.address"
								placeholder="Enter Address"
								size="large"
							/>
						</n-form-item>
					</n-gi>
				</n-grid>
			</n-form>
			<!-- Add Child -->

			<n-card
				v-for="(child, index) in dataCandidate.childrens.filter(child => child.is_delete !== 1)"
				:key="index"
				class="!rounded-xl !border-[#DADADA] mt-2"
			>
				<header class="md:flex md:justify-between mb-6">
					<div class="flex gap-x-2 md:justify-center items-center">
						<Icon icon="mingcute:user-4-fill" width="20" height="20" style="color: #2073de" />
						<h4 class="text-[#2073DE]">ข้อมูลบุตรคนที่ {{ index + 1 }}</h4>
					</div>

					<div class="flex justify-end my-2 md:my-0">
						<n-button class="" size="small" ghost color="#fe4c4c" @click="removeChild(index, child)">
							<template #icon>
								<n-icon>
									<Icon icon="tabler:trash" width="16" height="16" style="color: #fe4c4c" />
								</n-icon>
							</template>
							Delete
						</n-button>
					</div>
				</header>

				<!-- @vue-ignore -->
				<n-form :ref="el => (formRefChild[index] = el)" :model="child" :rules="childRules">
					<n-grid :x-gap="12" cols="1 400:4 500:5" item-responsive>
						<n-gi span="2">
							<n-form-item label="First Name" path="firstname">
								<n-input
									type="text"
									v-model:value="child.firstname"
									placeholder="Enter First Name"
									size="large"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Last Name" path="lastname">
								<n-input
									type="text"
									v-model:value="child.lastname"
									placeholder="Enter Last Name"
									size="large"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 400:2 500:1">
							<n-form-item label="Nickname" path="nickname">
								<n-input
									type="text"
									v-model:value="child.nickname"
									placeholder="Enter Nickname"
									size="large"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Gender" path="gender">
								<n-select
									size="large"
									v-model:value="child.gender"
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									:options="GENDER_OPTIONS"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3 400:4 500:3">
							<n-form-item label="Birth date" path="birthdate">
								<n-date-picker
									size="large"
									v-model:value="child.birthdate"
									type="date"
									class="w-full"
									format="dd/MM/yyyy"
								/>
							</n-form-item>
						</n-gi>
					</n-grid>
				</n-form>
			</n-card>
			<n-button type="info" class="!w-full !mt-4 !mb-2" @click="addChild">
				<n-icon class="mr-2">
					<Icon icon="icons8:plus" width="20" height="20" style="color: #ffff" />
				</n-icon>
				Add Child
			</n-button>
			<!-- Add Formula -->
			<n-card
				v-for="(item, index) in dataCandidate.candidateFormulas.filter(
					formula => formula.formula.is_delete !== 1
				)"
				:key="index"
				class="!rounded-xl !border-[#DADADA] mt-2"
			>
				<header class="md:flex md:justify-between mb-6">
					<h4 class="text-[#2073DE]">Product Formula</h4>

					<div class="flex justify-end my-2 md:my-0">
						<n-button
							class="md:flex md:justify-between"
							size="small"
							ghost
							color="#fe4c4c"
							@click="removeProduct(index, item)"
						>
							<template #icon>
								<n-icon>
									<Icon icon="tabler:trash" width="16" height="16" style="color: #fe4c4c" />
								</n-icon>
							</template>
							Delete
						</n-button>
					</div>
				</header>
				<!-- @vue-ignore -->
				<n-form :ref="el => (formRefProduct[index] = el)" :model="item.formula" :rules="productRules">
					<n-grid :x-gap="12" cols="1 400:2 600:2" item-responsive>
						<n-gi>
							<n-form-item label="Product Name" path="id">
								<n-tree-select
									:options="productOption"
									size="large"
									v-model:value="item.formula.id"
									default-expand-all
									show-path
									@update:value="(value, option) => handleUpdateFormula(value, option, index)"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3 600:1">
							<n-form-item label="Formula Description" path="description">
								<n-input
									size="large"
									v-model:value="item.formula.description"
									placeholder="Pleas Enter Description"
									disabled
								/>
							</n-form-item>
						</n-gi>
					</n-grid>
				</n-form>
			</n-card>
			<n-button type="info" class="!w-full !mt-4" @click="addProduct">
				<n-icon class="mr-2">
					<Icon icon="icons8:plus" width="20" height="20" style="color: #ffff" />
				</n-icon>
				Add Product Formula
			</n-button>

			<template #footer>
				<n-space justify="end">
					<n-button @click="handleCancelCandidate" type="default" size="large">Cancel</n-button>
					<n-button @click="handleEditCandidate" type="primary" size="large">Save</n-button>
				</n-space>
			</template>
		</n-modal>

		<n-modal
			v-if="isModalManagement.event === MODAL_TYPE.RANDOM"
			v-model:show="isModalManagement.value"
			:bordered="false"
			aria-modal="false"
			preset="card"
			size="huge"
			:style="{
				width: '800px'
			}"
			:title="titleModal"
		>
			<n-form ref="formRefRandomCandidate" :model="randomCandidate" :rules="randomCandidateRules">
				<n-form-item label="Number Candidate" path="candidate_amount">
					<span class="w-full">
						<n-input
							type="text"
							size="large"
							v-model:value="randomCandidate.candidate_amount"
							placeholder="Pleas Enter Number For Random Candidate"
							:disabled="candidateBAStore.candidateCount?.count.total === 0"
						/>

						<small class="text-gray-400">
							เหลือ Candidate ที่สามารถ Random ได้ {{ candidateBAStore.candidateCount?.count.total }} คน
						</small>
					</span>
				</n-form-item>
			</n-form>
			<template #footer>
				<n-space justify="end">
					<n-button @click="handleCancelCandidate" type="default" size="large">Cancel</n-button>
					<n-button
						v-if="candidateBAStore.candidateCount?.count.total !== 0"
						@click="postRandomCandidate"
						type="primary"
						size="large"
					>
						Save
					</n-button>
				</n-space>
			</template>
		</n-modal>

		<n-modal
			v-if="isModalManagement.event === MODAL_TYPE.ADD_TEAM"
			v-model:show="isModalManagement.value"
			:bordered="false"
			aria-modal="false"
			preset="card"
			size="huge"
			:style="{
				width: '800px'
			}"
			:title="titleModal"
			:on-after-leave="handleCancelCandidate"
		>
			<n-form ref="formRefReviewCandidate" :model="randomCandidate" :rules="reviewCandidateRules">
				<n-form-item label="Assign to User" path="assign_user_id">
					<n-select
						size="large"
						v-model:value="randomCandidate.assign_user_id"
						placeholder="Pleas Assign User"
						:options="reviewListOption"
						:render-label="renderLabel"
						:render-tag="renderMultipleSelectTag"
					/>
				</n-form-item>
				<n-form-item label="Candidate List" path="number">
					<div class="border rounded-lg w-full h-full px-6 py-2">
						<span v-for="(item, index) in checkedRowValues" class="flex my-3 items-center gap-x-4">
							<n-checkbox
								:checked="checkedRowKeysRef.includes(item.id)"
								@update:checked="handleCheck(item)"
								size="large"
							/>
							<p class="w-4 text-center">{{ index + 1 }}</p>
							<div class="flex items-center justify-center gap-x-4">
								<n-avatar class="!bg-blue-400 !h-8 !w-8 !text-xs !hidden md:!block" round>
									{{ item.firstname[0].toUpperCase() }}
								</n-avatar>
								<div>
									<p>{{ item.firstname + " " + item.lastname }}</p>
									<p class="text-xs">{{ item.email }}</p>
								</div>
							</div>
						</span>
					</div>
				</n-form-item>
			</n-form>
			<template #footer>
				<n-space justify="end">
					<n-button @click="handleCancelCandidate" type="default" size="large">Cancel</n-button>
					<n-button @click="submitReview" type="primary" size="large">Save</n-button>
				</n-space>
			</template>
		</n-modal>
	</div>
</template>

<script lang="ts">
import { defineComponent, h, ref, computed, reactive, onMounted, watch } from "vue"
import {
	NDataTable,
	NModal,
	NPagination,
	NInput,
	NSpace,
	NButton,
	NCard,
	NForm,
	NFormItem,
	NSelect,
	NTag,
	NGrid,
	NGi,
	NIcon,
	NDatePicker,
	NAvatar,
	NTreeSelect,
	useDialog,
	NCheckbox
} from "naive-ui"
import { Icon } from "@iconify/vue"
import moment from "moment"

import type {
	DataTableColumns,
	DataTableRowKey,
	TreeSelectOverrideNodeClickBehavior,
	FormInst,
	FormRules,
	FormItemRule
} from "naive-ui"

import { PAGE_SIZES, GENDER_OPTIONS } from "@/components/utils/constants"
import { MODAL_TYPE } from "@/views/UserManagement/User/index.vue"
import { useMasterDataStore } from "@/stores/useMasterDataStore"
import { useCandidateBAStore } from "@/stores/useCandidateBAStore"
import { useSystemMasterData } from "@/stores/useSystemMasterData"
import _ from "lodash"
import { useRouter } from "vue-router"
import { checkPermission, checkPermissionCandidateView } from "@/utils/auth"
import { renderMultipleSelectTag, renderLabel } from "@/components/common/SelectNaiveStyle"
import { useTeamManagementStore } from "@/stores/useTeamManagementStore"
interface RowData {
	id: number
	key?: number
	firstname: string
	lastname: string
	email: string
	birthdate?: string
	facebook: string
	line: string
	telephone: string
	remark: string
	line_group_id: number
	is_contactable_telephone: number
	is_contactable_sms: number
	occupation: string
	created_at: string
	call_date: string | null
	childrens: {
		id: number
		firstname: string
		lastname: string
		gender: string | null
		is_active: number
		is_delete: number
	}[]
	candidateFormulas?: { id: number; formula: { brand: { name: string }; name: string; description: string } }[]
}

export default defineComponent({
	name: "Candidate",
	components: {
		NDataTable,
		NModal,
		NPagination,
		NInput,
		NSpace,
		NButton,
		NCard,
		NForm,
		NFormItem,
		NSelect,
		NIcon,
		NGrid,
		NGi,
		NDatePicker,
		NAvatar,
		NTreeSelect,
		NCheckbox,
		Icon
	},
	setup() {
		const systemMasterDataStore = useSystemMasterData()
		const masterDataStore = useMasterDataStore()
		const candidateBAStore = useCandidateBAStore()
		const teamManagementStore = useTeamManagementStore()
		const teamOptions = ref<any>([])
		const dialog = useDialog()
		const router = useRouter()
		const brands = ref<any>([])
		const brandOption = computed(() =>
			brands.value.map((brand: any) => ({
				label: brand.name,
				value: brand.id
			}))
		)
		const productOption = ref<any>([])

		const reviewListOption = computed(() =>
			candidateBAStore.reviewList.map((candidate: any) => ({
				label: candidate.firstname + " " + candidate.lastname,
				value: candidate.id
			}))
		)
		const override: TreeSelectOverrideNodeClickBehavior = ({ option }) => {
			if (option.children) {
				return "toggleExpand"
			}
			return "default"
		}
		const showModalRef = ref(false)
		const checkedRowKeysRef = ref<DataTableRowKey[]>([])
		const formRefCandidate = ref<FormInst | null>(null)
		const formRefChild = ref<(FormInst | null)[]>([])
		const formRefProduct = ref<(FormInst | null)[]>([])
		const formRefRandomCandidate = ref<FormInst | null>(null)
		const formRefReviewCandidate = ref<FormInst | null>(null)
		const isAllChecked = computed(() => checkedRowKeysRef.value.length === candidateBAStore.candidates.data.length)
		const isIndeterminate = computed(() => checkedRowKeysRef.value.length > 0 && !isAllChecked.value)
		const pagination = reactive({
			page: 1,
			limit: 10,
			is_available: 1
		})
		const filterApi = reactive({
			name: "",
			telephone_status: null,
			sms_status: null,
			date: null,
			line_group_id:null
		})
		const candidateDetail = reactive({
			facebook: "",
			line: "",
			telephone: "",
			email: "",
			firstname: "",
			lastname: "",
			nickname: "",
			birthdate: null,
			is_contactable_telephone: 1,
			is_contactable_sms: 1,
			occupation: "",
			address: "",
			remark: "",
			childrens: [
				{
					id: 0,
					nickname: "",
					firstname: "",
					lastname: "",
					gender: "",
					birthdate: null
				}
			],
			candidateFormulas: [
				{
					formula_id: 0,
					formula: {
						name: null,
						description: null
					}
				}
			]
		})
		const randomCandidate = ref({
			assign_user_id: null,
			candidate_amount: null
		})
		const isModalManagement = reactive({
			value: false,
			event: MODAL_TYPE.VIEW
		})
		const titleModal = computed(() => {
			switch (isModalManagement.event) {
				case MODAL_TYPE.VIEW:
					return "Information"
				case MODAL_TYPE.EDIT:
					return "Edit Information Candidate"
				case MODAL_TYPE.RANDOM:
					return "Random Candidate"
				case MODAL_TYPE.ADD_TEAM:
					return "Select Candidate List"
				default:
					return ""
			}
		})

		const defaultValue = {
			id: 0,
			firstname: "",
			lastname: "",
			nickname: "",
			birthdate: null,
			gender: "",
			occupation: "",
			email: "",
			line: "",
			address: "",
			telephone: "",
			facebook: "",
			is_contactable_telephone: "",
			remark: "",
			is_contactable_sms: "",
			call_date: null,
			line_group_id: null,
			childrens: [
				{
					id: 0,
					nickname: "",
					firstname: "",
					lastname: "",
					birthdate: null,
					gender: null,
					is_active: 1,
					is_delete: 0
				}
			],
			candidateFormulas: [
				{
					formula: {
						id: null,
						brand: { name: null },
						name: null,
						description: null,
						is_delete: 0,
						is_active: 1
					}
				}
			]
		}

		const dataCandidate = reactive({ ...defaultValue })
		const column = createColumns()

		function createColumns(): DataTableColumns<RowData> {
			return [
				{
					title: () =>
						h(NCheckbox, {
							checked: isAllChecked.value,
							indeterminate: isIndeterminate.value,
							onUpdateChecked: handleCheckAll,
							disabled: !checkPermission(["ba-manage-all"])
						}),
					key: "checkbox",
					width: "50px",
					align: "center",
					render(row: any) {
						return h("div", { className: "flex justify-center" }, [
							h(NCheckbox, {
								checked: checkedRowKeysRef.value.includes(row.id),
								disabled: !checkPermissionCandidateView(
									["ba-manage-all", "ba-candidate-review-all", "ba-candidate-review-brand"],
									row.candidateFormulas.map((cf: any) => cf.formula.brand_id).join()
								),
								onUpdateChecked: () => {
									handleCheck(row)
								}
							})
						])
					}
				},
				{
					title: "No.",
					key: "no",
					width: "50px",
					className: "whitespace-nowrap",
					render(row, index) {
						return h("div", pagination.limit * (pagination.page - 1) + index + 1)
					}
				},
				{
					title: "Call Date",
					key: "call_date",
					width: "50px",
					className: "whitespace-nowrap ",
					render(row, index) {
						return h(
							"div",
							{ class: "text-center" },
							row?.call_date ? moment(row?.call_date).format("DD/MM/YYYY HH:mm") : "-"
						)
					}
				},
				{
					title: "Candidate",
					key: "candidate",
					width: "250px",
					render(row) {
						return h("div", { className: "flex gap-2 truncate" }, [
							h(
								NAvatar,
								{
									style: {
										color: "white",
										backgroundColor: "skyblue",
										borderRadius: "100%"
									}
								},
								row.firstname.length > 0 ? row.firstname[0].toUpperCase() : ""
							),
							h("div", [
								h("div", `${row.firstname}  ${row.lastname}`),
								h("div", { className: "!text-xs mt-1" }, row.email)
							])
						])
					}
				},
				{
					title: "Line group",
					key: "line_group_id",
					width: "200px",
					className: "whitespace-nowrap truncate",
					render(row) {
						const teamName =
							teamOptions.value.find((team: any) => team.value === row.line_group_id)?.label || "-"
						return h("div", {}, teamName)
					}
				},
				{
					title: "Child Information",
					key: "childInformation",
					className: "!text-center whitespace-nowrap",
					width: "100px",
					render(row) {
						return h("div", [h("div", {}, row.childrens.length + " คน")])
					}
				},
				{
					title: "Telephone Status​",
					key: "is_contactable_telephone",
					className: "!text-center  whitespace-nowrap",
					width: "100px",
					render(row) {
						const telephoneLabel =
							TELEPHONE_OPTIONS.find(option => option.value === row?.is_contactable_telephone)?.label ||
							(row?.is_contactable_telephone === 0 ? "ไม่ระบุ" : "")
						const type =
							row.is_contactable_telephone !== 1 &&
							row.is_contactable_telephone !== 0 &&
							row.is_contactable_telephone <= 5
								? "success"
								: "error"
						const textColorClass =
							row.is_contactable_telephone !== 1 &&
							row.is_contactable_telephone !== 0 &&
							row.is_contactable_telephone <= 5
								? "!text-green-500"
								: "!text-red-500"
						return h("div", { class: "flex gap-2 justify-center " }, [
							h(
								NTag,
								{
									class: `whitespace-nowrap truncate  ${textColorClass}`,
									size: "medium",
									round: true,
									type: type
								},
								h("p", { class: `truncate max-w-32 ${textColorClass}` }, telephoneLabel)
							)
						])
					}
				},
				{
					title: "SMS Status",
					key: "is_contactable_sms",
					className: "!text-center  whitespace-nowrap",
					width: "100px",
					render(row) {
						return h("div", { class: "flex gap-2 justify-center" }, [
							row.is_contactable_sms === 1
								? h(
										NTag,
										{
											class: `whitespace-nowrap truncate `,
											size: "medium",
											round: true,
											type: "success"
										},
										h("p", { class: `truncate max-w-32 !text-green-500 }` }, "IS SMS Contactable")
									)
								: h(
										NTag,
										{
											class: `whitespace-nowrap truncate `,
											size: "medium",
											round: true,
											type: "error"
										},
										h(
											"p",
											{ class: `truncate max-w-32 !text-red-500 }` },
											"Unable to contactable via SMS"
										)
									)
						])
					}
				},
				{
					title: "Action",
					key: "action",
					className: "!text-center",
					width: "200px",
					render(row) {
						return h("div", { class: "flex gap-x-6 justify-center" }, [
							checkPermissionCandidateView(
								["ba-manage-all", "ba-candidate-view-all", "ba-candidate-view-brand"],
								row.candidateFormulas?.map((cf: any) => cf.formula.brand_id).join() || ""
							) &&
								h(Icon, {
									icon: "mdi:eye-outline",
									class: "w-6 h-6 cursor-pointer",
									onClick: async () => {
										await candidateBAStore.getCandidateById(row.id)
										Object.assign(candidateDetail, candidateBAStore.candidate)
										isModalManagement.value = true
										isModalManagement.event = MODAL_TYPE.VIEW
									}
								}),
							checkPermissionCandidateView(
								["ba-manage-all", "ba-candidate-edit-all", "ba-candidate-edit-brand"],
								row.candidateFormulas?.map((cf: any) => cf.formula.brand_id).join() || ""
							) &&
								h(Icon, {
									icon: "flowbite:edit-outline",
									class: "w-6 h-6 cursor-pointer",
									onClick: async () => {
										await candidateBAStore.getCandidateById(row.id)
										Object.assign(dataCandidate, {
											...candidateBAStore.candidate,
											birthdate: candidateBAStore.candidate.birthdate
												? moment(candidateBAStore.candidate.birthdate).valueOf()
												: null,
											call_date: candidateBAStore.candidate.call_date
												? moment(candidateBAStore.candidate.call_date).valueOf()
												: null,
											childrens: candidateBAStore.candidate.childrens.map((child: any) => ({
												...child,
												birthdate: child.birthdate ? moment(child.birthdate).valueOf() : null
											})),
											candidateFormulas: candidateBAStore.candidate.candidateFormulas.map(
												(cf: any) => ({
													...cf,
													formula: {
														...cf.formula,
														id: `_${cf.formula.id}`
													}
												})
											)
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
		function handleCancelCandidate() {
			Object.assign(dataCandidate, defaultValue)
			isModalManagement.event = MODAL_TYPE.VIEW
			isModalManagement.value = false
			lastCheckedRowValues.value = []
			checkedRowKeysRef.value = []
		}
		function calculateAge(birthdate: any) {
			const birthdateMoment = moment(birthdate)
			const today = moment()

			let years = today.diff(birthdateMoment, "years")
			birthdateMoment.add(years, "years")

			let months = today.diff(birthdateMoment, "months")
			birthdateMoment.add(months, "months")

			if (months >= 12) {
				years += 1
				months -= 12
			}

			return `${years} ปี ${months} เดือน`
		}

		function getBrandName(formula_id: number) {
			const brand = brands.value.find((b: { id: number }) => b.id === formula_id)
			return brand ? brand.name : "Unknown Brand"
		}
		const rules: FormRules = {
			firstname: {
				required: true,
				message: "Please input First Name",
				trigger: ["blur", "input"]
			},
			lastname: {
				required: true,
				message: "Please input Last Name",
				trigger: ["blur", "input"]
			},
			nickname: {
				required: true,
				message: "Please input Nickname",
				trigger: ["blur", "input"]
			},
			gender: {
				required: true,
				message: "Please select Gender",
				trigger: ["change"]
			},
			birthdate: {
				required: true,
				validator: value => {
					return value !== null && value !== undefined
				},
				message: "Please select Birth date",
				trigger: ["change"]
			},
			career: {
				required: true,
				trigger: ["blur", "change"],
				message: "Please input career"
			},
			email: {
				required: true,
				trigger: ["blur", "change"],
				message: "Please input email"
			},
			telephone: {
				required: true,
				trigger: ["blur", "change"],
				message: "Please input telephone"
			},
			is_contactable_telephone: {
				required: true,
				trigger: ["change"],
				validator: value => {
					return value !== undefined && value !== null
				},
				message: "Please select is contactable telephone"
			},
			is_contactable_sms: {
				required: true,
				trigger: ["change"],
				validator: value => {
					return value !== undefined && value !== null
				},
				message: "Please select is contactable sms"
			},
			address: {
				required: true,
				trigger: ["blur", "change"],
				message: "Please input address"
			},
			facebook: {
				required: true,
				trigger: ["blur", "change"],
				message: "Please input facebook"
			},
			line: {
				required: true,
				trigger: ["blur", "change"],
				message: "Please input line"
			}
		}
		const TELEPHONE_OPTIONS = reactive([{ label: "", value: 1 }])
		onMounted(async () => {
			await candidateBAStore.getCandidates({ ...pagination, ...filterApi })
			await masterDataStore.getBrands()
			await teamManagementStore.getTeamAllEditBA()
			teamOptions.value = teamManagementStore.teamAllBA.data.map(
				(team: { id: number; name: string; is_active: number; is_delete: number }) => ({
					value: team.id,
					label: team.name,
					is_active: team.is_active,
					is_delete: team.is_delete
				})
			)
			brands.value = masterDataStore.brands
			productOption.value = brands.value.map((brand: any) => ({
				label: brand.name,
				key: brand.id,
				children: brand.formulas.map((formula: any) => ({
					label: formula.name,
					key: `_${formula.id}`,
					description: formula.description
				}))
			}))
			await systemMasterDataStore.getMappingData("telephone_options")
			Object.assign(TELEPHONE_OPTIONS, systemMasterDataStore.mapSystemOptions.telephone_options)
		})
		// watch(pagination, async value => {
		// 	await candidateBAStore.getCandidates({ ...value, ...filterApi })
		// })
		// watch(filterApi, async value => {
		// 	pagination.page = 1
		// 	/// Call API
		// 	await candidateBAStore.getCandidates({ ...pagination, ...value })
		// })
		function createRequestBody() {
			const body: any = {
				...pagination,
				name: filterApi.name,
				line_group_id: filterApi.line_group_id,
				telephone_status: filterApi.telephone_status,
				sms_status: filterApi.sms_status
			}

			if (filterApi.date !== null) {
				body.calldate_startdate = moment(filterApi.date[0]).format("YYYY-MM-DD HH:mm:ss")
				body.calldate_enddate = moment(filterApi.date[1]).format("YYYY-MM-DD HH:mm:ss")
			}

			return body
		}

		async function fetchCandidate() {
			const body = createRequestBody()
			await candidateBAStore.getCandidates(body)
		}

		watch(filterApi, async value => {
			pagination.page = 1
			await fetchCandidate()
		})
		watch(pagination, fetchCandidate)
		const handleSearch = _.debounce((value: string) => {
			filterApi.name = value
		}, 500)
		const paginateCount = computed(() => {
			const countPage = pagination.limit * pagination.page
			const totalTeams = candidateBAStore?.candidates?.total ?? 0
			return countPage > totalTeams ? totalTeams : countPage
		})
		const itemCount = computed(() => {
			return candidateBAStore?.candidates?.total || 0
		})
		function addChild() {
			const newChild = {
				id: 0,
				nickname: "",
				firstname: "",
				lastname: "",
				gender: null,
				birthdate: null,
				is_active: 1,
				is_delete: 0
			}
			dataCandidate.childrens.push(newChild)
		}

		function addProduct() {
			const newProduct = {
				formula: {
					id: null,
					id_index: 0,
					name: null,
					description: null,
					brand: { id: null, name: null },
					is_active: 1,
					is_delete: 0
				}
			}
			dataCandidate.candidateFormulas.push(newProduct)
		}

		function removeChild(index: number, child: any) {
			if (child.id !== dataCandidate.childrens[index].id) {
				dataCandidate.childrens.splice(index, 1)
			} else {
				dataCandidate.childrens[index].is_delete = 1
				dataCandidate.childrens[index].is_active = 0
			}
		}

		function removeProduct(index: number, item: any) {
			if (item.formula.id_index !== undefined) {
				dataCandidate.candidateFormulas.splice(index, 1)
			} else {
				dataCandidate.candidateFormulas[index].formula.is_delete = 1
				dataCandidate.candidateFormulas[index].formula.is_active = 0
			}
		}

		async function reviewAll() {
			if (checkPermission(["ba-manage-all"])) {
				await candidateBAStore.getCandidateReviewList()
				isModalManagement.value = true
				isModalManagement.event = MODAL_TYPE.ADD_TEAM
			} else {
				const body = {
					assign_user_id: 0,
					candidate_id: checkedRowKeysRef.value
				}
				await candidateBAStore.createCandidateToReview(body)
				router.push("/workspace")
			}
		}
		async function submitReview() {
			formRefReviewCandidate.value?.validate().then(async () => {
				const body = {
					assign_user_id: randomCandidate.value.assign_user_id,
					candidate_id: checkedRowKeysRef.value
				}
				await candidateBAStore.createCandidateToReview(body)
				router.push("/workspace")
			})
		}
		async function randomReview() {
			await candidateBAStore.getCandidateCount()
			isModalManagement.value = true
			isModalManagement.event = MODAL_TYPE.RANDOM
		}
		async function postRandomCandidate() {
			const body = {
				assign_user_id: 0,
				candidate_amount: Number(randomCandidate.value.candidate_amount)
			}
			formRefRandomCandidate.value?.validate().then(async () => {
				await candidateBAStore.createCandidateToReview(body)
				router.push("/workspace")
			})
		}
		function handleEditCandidate(e: MouseEvent) {
			e.preventDefault()

			const formateBody = {
				id: dataCandidate.id,
				call_date: moment(dataCandidate.call_date).format("YYYY-MM-DD HH:mm:ss"),
				line_group_id: dataCandidate.line_group_id,
				firstname: dataCandidate.firstname,
				lastname: dataCandidate.lastname,
				gender: dataCandidate.gender,
				email: dataCandidate.email,
				facebook: dataCandidate.facebook,
				telephone: dataCandidate.telephone,
				line: dataCandidate.line,
				is_contactable_telephone: dataCandidate.is_contactable_telephone,
				is_contactable_sms: dataCandidate.is_contactable_sms,
				address: dataCandidate.address,
				remark: dataCandidate.remark,
				birthdate: moment(dataCandidate.birthdate).format("YYYY-MM-DD"),
				childs: dataCandidate.childrens.map((child: any) => ({
					id: child.id,
					nickname: child.nickname,
					firstname: child.firstname,
					lastname: child.lastname,
					gender: child.gender,
					birthdate: moment(child.birthdate).format("YYYY-MM-DD"),
					is_active: child.is_active,
					is_delete: child.is_delete
				})),
				formulas: dataCandidate.candidateFormulas.map((formula: any) => {
					const brandId = String(formula.formula.id)
					const formulaIdParts = brandId.split("_")
					return {
						formula_id: Number(formulaIdParts[1]),
						is_active: Number(formula.formula.is_active),
						is_delete: Number(formula.formula.is_delete)
					}
				})
			}
			dialog.warning({
				title: "ยืนยันการแก้ไขข้อมูล",
				content: `ข้อมูลของผู้ใช้ ${dataCandidate.firstname} ${dataCandidate.lastname} หรือไม่ ?`,
				positiveText: "แน่ใจ",
				negativeText: "ยกเลิก",
				onPositiveClick: async () => {
					await candidateBAStore.updateCandidate(formateBody)
					await candidateBAStore.getCandidates({ ...pagination, ...filterApi })
					isModalManagement.value = false
				}
			})
		}

		const handleUpdateFormula = (value: any, option: any, index: number) => {
			const formulas = {
				formula: {
					id: option.key,
					brand: { id: option.key, name: null },
					name: null,
					description: option.description,
					is_delete: 0,
					is_active: 1
				}
			}
			dataCandidate.candidateFormulas[index] = formulas
		}

		const childRules: FormRules = {
			firstname: {
				required: true,
				message: "Please input First Name",
				trigger: ["blur", "input"]
			},
			lastname: {
				required: true,
				message: "Please input Last Name",
				trigger: ["blur", "input"]
			},
			nickname: {
				required: true,
				message: "Please input Nickname",
				trigger: ["blur", "input"]
			},
			gender: {
				required: true,
				message: "Please select Gender",
				trigger: ["change"]
			},
			birthdate: {
				type: "date",
				required: true,
				message: "Please select Birth date",
				trigger: ["change"]
			}
		}
		const productRules: FormRules = {
			id: {
				required: true,
				message: "Please select Product Name",
				trigger: ["change"]
			}
		}
		const randomCandidateRules: FormRules = {
			candidate_amount: {
				required: true,
				message: "Please Enter Number of Candidates",
				trigger: ["input", "blur"],
				validator: (rule: FormItemRule, value: string) => {
					if (!/^\d+$/.test(value)) {
						return new Error("กรุณากรอกเฉพาะตัวเลขเท่านั้น")
					}
					return true
				}
			}
		}
		const reviewCandidateRules: FormRules = {
			assign_user_id: {
				type: "number",
				required: true,
				message: "Please select Assign User",
				trigger: ["change"]
			}
		}
		const lastCheckedRowValues = ref<any>([])
		const checkedRowValues = computed(() => {
			if (isModalManagement.event === MODAL_TYPE.ADD_TEAM) {
				return lastCheckedRowValues.value
			} else {
				const values = checkedRowKeysRef.value
					.map(key => candidateBAStore.candidates.data.find(row => row.id === key))
					.filter(row => row !== undefined)
				return values
			}
		})
		watch(checkedRowValues, async newValues => {
			if (isModalManagement.event !== MODAL_TYPE.ADD_TEAM) {
				lastCheckedRowValues.value = await Promise.resolve(newValues)
			}
		})
		const handleCheck = (rowKey: any) => {
			if (checkedRowKeysRef.value.includes(rowKey.id)) {
				checkedRowKeysRef.value = checkedRowKeysRef.value.filter(key => key !== rowKey.id)
			} else {
				checkedRowKeysRef.value.push(rowKey.id)
			}
		}

		function handleCheckAll(checked: boolean) {
			if (checked) {
				checkedRowKeysRef.value = candidateBAStore.candidates.data.map(row => row.id)
			} else {
				checkedRowKeysRef.value = []
			}
		}
		return {
			showModalRef,
			checkedRowKeysRef,
			handleCheck,
			column,
			PAGE_SIZES,
			isModalManagement,
			pagination,
			titleModal,
			handleCancelCandidate,
			formRefCandidate,
			formRefChild,
			formRefProduct,
			formRefRandomCandidate,
			rules,
			MODAL_TYPE,
			dataCandidate,
			renderMultipleSelectTag,
			renderLabel,
			calculateAge,
			getBrandName,
			addChild,
			removeChild,
			addProduct,
			removeProduct,
			childRules,
			GENDER_OPTIONS,
			brands,
			candidateBAStore,
			paginateCount,
			itemCount,
			brandOption,
			MOCK_OPTIONS_SMS: [
				{ label: "IS SMS Contactable", value: 1 },
				{ label: "Unable to contactable via SMS", value: 0 }
			],
			handleSearch,
			candidateDetail,
			productOption,
			productRules,
			reviewAll,
			randomCandidate,
			randomReview,
			randomCandidateRules,
			postRandomCandidate,
			handleEditCandidate,
			override,
			TELEPHONE_OPTIONS,
			checkPermission,
			handleUpdateFormula,
			checkedRowValues,
			submitReview,
			reviewListOption,
			reviewCandidateRules,
			formRefReviewCandidate,
			filterApi,
			teamOptions
		}
	}
})
</script>
<style>
.n-form-item.n-form-item--top-labelled .n-form-item-label {
	color: #5f6674;
}
</style>
