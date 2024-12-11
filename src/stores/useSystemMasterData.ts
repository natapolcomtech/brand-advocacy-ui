import { defineStore } from "pinia"
import { ApiService } from "@/services/apiService"
import type { AnyFn } from "@vueuse/core"

export const useSystemMasterData = defineStore("systemMasterData", {
	state: (): {
		systemData: any
		systemDataOptions: any
		mapSystemOptions: any
	} => ({
		systemData: [],
		systemDataOptions: [],
		mapSystemOptions: {
			facebook_age_option: [],
			facebook_trust_option: [],
			facebook_response_option: [],
			line_member_option: [],
			line_response_option: [],
			review_status_option: [],
			review_type_option: [],
			telephone_options: []
		}
	}),
	actions: {
		async getSystemMasterData() {
			try {
				const resp = await ApiService.v1.SystemMasterData.getAllSystemMasterData()
				this.systemDataOptions = resp?.data?.data
				return resp
			} catch (error: any) {
				console.error(error.message_th)
			}
		},
		async getSystemMasterDataByCategory(params: any) {
			try {
				const resp = await ApiService.v1.SystemMasterData.getSystemMasterData(params)
				this.systemData = resp?.data?.data
				return resp
			} catch (error: any) {
				console.error(error.message_th)
			}
		},
		async createSystemMasterData(data: any) {
			try {
				const resp = await ApiService.v1.SystemMasterData.createSystemMasterData(data)
				return resp
			} catch (error: any) {
				console.error(error.message_th)
			}
		},
		async updateSystemMasterData(data: any) {
			try {
				const resp = await ApiService.v1.SystemMasterData.updateSystemMasterData(data)
				return resp
			} catch (error: any) {
				console.error(error.message_th)
			}
		},
		async getMapSystemMasterDataByCategory(params: any) {
			try {
				const resp = await ApiService.v1.SystemMasterData.getSystemMasterData(params)
				return resp
			} catch (error: any) {
				console.error(error.message_th)
			}
		},
		async getMappingData(key: string) {
			const resp = await this.getMapSystemMasterDataByCategory({ category: key })
			switch (key) {
				case "facebook_age_option":
					this.mapSystemOptions.facebook_age_option = resp?.data?.data.map((item: any) => ({
						label: item.label,
						value: item.value
					}))
					break
				case "facebook_trust_option":
					this.mapSystemOptions.facebook_trust_option = resp?.data?.data.map((item: any) => ({
						label: item.label,
						value: item.value
					}))
					break
				case "facebook_response_option":
					this.mapSystemOptions.facebook_response_option = resp?.data?.data.map((item: any) => ({
						label: item.label,
						value: item.value
					}))
					break
				case "line_member_option":
					this.mapSystemOptions.line_member_option = resp?.data?.data.map((item: any) => ({
						label: item.label,
						value: item.value
					}))
					break
				case "line_response_option":
					this.mapSystemOptions.line_response_option = resp?.data?.data.map((item: any) => ({
						label: item.label,
						value: item.value
					}))
					break
				case "review_status_option":
					this.mapSystemOptions.review_status_option = resp?.data?.data.map((item: any) => ({
						label: item.label,
						value: item.value
					}))
					break
				case "review_type_option":
					this.mapSystemOptions.review_type_option = resp?.data?.data.map((item: any) => ({
						label: item.label,
						value: item.value
					}))
					break
				case "telephone_options":
					this.mapSystemOptions.telephone_options = resp?.data?.data.map((item: any) => ({
						label: item.label,
						value: item.value
					}))
					break
				default:
					break
			}
		}
	}
})
