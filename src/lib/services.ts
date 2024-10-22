// src\lib\services.ts
import {
  CreateModelsDto,
  CreateServiceDto,
  UpdateServiceDto,
  UpdateModelsDto,
} from "@/utils/dtos";
import prisma from "@/utils/db";

// CRUD of services

export async function createServices({ title }: CreateServiceDto) {
  try {
    const service = await prisma.services.create({
      data: {
        title,
      },
    });
    return service;
  } catch (error) {
    console.log("error create a service", error);
    throw new Error("error create a service");
  }
}

export async function updateService({ id, title, isActive }: UpdateServiceDto) {
  try {
    const updateService = await prisma.services.update({
      where: { id },
      data: {
        title,
        isActive,
      },
    });

    return updateService;
  } catch (error) {
    console.log("error update a service", error);
    throw new Error("error update a service");
  }
}

export async function DeleteService(id: number) {
  try {
    const deleteModels = prisma.devicesModels.deleteMany({
      where: { serviceID: id },
    });

    const deleteService = prisma.services.delete({
      where: { id },
    });

    const transaction = await prisma.$transaction([
      deleteModels,
      deleteService,
    ]);

    return transaction;
  } catch (error) {
    console.log("error delete a service", error);
    throw new Error("error delete a service");
  }
}

export async function GetServiceByID(id: number) {
  try {
    const getServicebyid = await prisma.services.findUnique({
      where: { id },
      include: { DevicesModels: true },
    });

    return getServicebyid;
  } catch (error) {
    console.log("error get a service", error);
    throw new Error("error get a service");
  }
}

export async function GetAllServices() {
  try {
    const getallServices = await prisma.services.findMany({
      where: { isActive: true },
      include: { DevicesModels: true },
      orderBy:{createAt:"desc"}
    });

    return getallServices;
  } catch (error) {
    console.log("error get all services", error);
    throw new Error("error get all services");
  }
}

// CRUD of device models

export async function createDeviceModel({ serviceID, title }: CreateModelsDto) {
  try {
    const deviceModel = await prisma.devicesModels.create({
      data: {
        serviceID,
        title,
      },
    });
    return deviceModel;
  } catch (error) {
    console.log("error create a deviceModel", error);
    throw new Error("error create a deviceModel");
  }
}

export async function deleteDeviceModel(id: number) {
  try {
    const deletedeviceModel = await prisma.devicesModels.delete({
      where: { id },
    });
    return deletedeviceModel;
  } catch (error) {
    console.log("error delete a deviceModel", error);
    throw new Error("error delete a deviceModel");
  }
}

export async function getDeviceModelById(id: number) {
  try {
    const getdeviceModelbyid = await prisma.devicesModels.findUnique({
      where: { id },include:{services:true}
    });
    return getdeviceModelbyid;
  } catch (error) {
    console.log("error get a deviceModel by id", error);
    throw new Error("error get a deviceModel by id");
  }
}

export async function updateDeviceModel(
  id: number,
  { serviceID, title, isActive }: UpdateModelsDto
) {
  try {
    const updatedeviceModel = await prisma.devicesModels.update({
      where: { id },
      data: {
        serviceID,
        title,
        isActive,
      },
    });
    return updatedeviceModel;
  } catch (error) {
    console.log("error update a deviceModel by id", error);
    throw new Error("error update a deviceModel by id");
  }
}


export async function GetAllDeviceModel() {
    try {
      const getallDeviceModel = await prisma.devicesModels.findMany({
        where: { isActive: true },
        include:{services:true},
        orderBy:{createAt:"desc"}
      });
  
      return getallDeviceModel;
    } catch (error) {
      console.log("error get all DeviceModel", error);
      throw new Error("error get all DeviceModel");
    }
  }