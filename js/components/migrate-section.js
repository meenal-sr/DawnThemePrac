const migrateSection = () => {
  document.querySelectorAll('[data-migrate-section]').forEach((section) => {
    const sectionId = section.dataset['migrateSection'];
    if (!sectionId) return;
    document.querySelectorAll(`[data-section-target="${sectionId}"]`).forEach((target) => {
      target.innerHTML = section.innerHTML;
      section.style.display = 'none';
    });
  });
};

export const appendSection = () => {
  document.querySelectorAll('[data-append-section]').forEach((section) => {
    const sectionId = section.dataset['appendSection'];
    if (!sectionId) return;
    document.querySelectorAll(`[data-section-target="${sectionId}"]`).forEach((target) => {
      target.insertAdjacentHTML('beforeend', section.innerHTML);
      section.remove();
    });
  });
};

export default migrateSection;
