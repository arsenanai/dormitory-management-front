import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import CRoomTypePhotos from "@/components/CRoomTypePhotos.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      "Room Photos": "Room Photos",
      "Room Photo": "Room Photo",
      "Click on any photo to view full size": "Click on any photo to view full size",
      "Previous": "Previous",
      "Next": "Next",
    },
  },
});

describe("CRoomTypePhotos.vue", () => {
  it("renders nothing when no photos are provided", () => {
    const wrapper = mount(CRoomTypePhotos, {
      global: { plugins: [i18n] },
      props: { photos: [] },
    });
    expect(wrapper.html()).toContain("<!--v-if-->");
  });

  it("renders a row of photos when provided", () => {
    const photos = ["photo1.jpg", "photo2.jpg"];
    const wrapper = mount(CRoomTypePhotos, {
      global: { plugins: [i18n] },
      props: { photos },
    });
    expect(wrapper.findAll("img").length).toBe(2);
  });

  it("opens modal when a photo is clicked", async () => {
    const photos = ["photo1.jpg", "photo2.jpg"];
    const wrapper = mount(CRoomTypePhotos, {
      global: { plugins: [i18n], stubs: { CModal: true } },
      props: { photos },
    });

    await wrapper.findAll("img")[0].trigger("click");
    expect(wrapper.vm.showPhotoModal).toBe(true);
    expect(wrapper.vm.currentPhoto).toBe("photo1.jpg");
    expect(wrapper.vm.currentPhotoIndex).toBe(0);
  });

  it("navigates through photos in modal", async () => {
    const photos = ["photo1.jpg", "photo2.jpg"];
    const wrapper = mount(CRoomTypePhotos, {
      global: { plugins: [i18n], stubs: { CModal: { template: '<div><slot /></div>' } } },
      props: { photos },
    });

    // Open modal
    await wrapper.findAll("img")[0].trigger("click");
    
    // Mock navigation
    wrapper.vm.nextPhoto();
    expect(wrapper.vm.currentPhotoIndex).toBe(1);
    expect(wrapper.vm.currentPhoto).toBe("photo2.jpg");

    wrapper.vm.previousPhoto();
    expect(wrapper.vm.currentPhotoIndex).toBe(0);
    expect(wrapper.vm.currentPhoto).toBe("photo1.jpg");
  });
});
