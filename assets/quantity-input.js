if (!customElements.get('quantity-input')) {
  customElements.define(
    'quantity-input',
    class QuantityInput extends HTMLElement {
      constructor() {
        super();
        this.input = this.querySelector('input');
        this.minusButton = this.querySelector('button[name="minus"]');
        this.plusButton = this.querySelector('button[name="plus"]');

        this.minusButton.addEventListener('click', this.onMinusClick.bind(this));
        this.plusButton.addEventListener('click', this.onPlusClick.bind(this));
        this.input.addEventListener('change', this.onInputChange.bind(this));
      }

      onMinusClick() {
        this.changeQuantity(-1);
      }

      onPlusClick() {
        this.changeQuantity(1);
      }

      onInputChange() {
        this.validateQuantity();
      }

      changeQuantity(change) {
        const currentValue = parseInt(this.input.value) || 0;
        const step = parseInt(this.input.step) || 1;
        const newValue = currentValue + change * step;
        this.input.value = newValue;
        this.validateQuantity();
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
      }

      validateQuantity() {
        const value = parseInt(this.input.value);
        const min = parseInt(this.input.min) || 1;
        const max = this.input.max ? parseInt(this.input.max) : null;
        const step = parseInt(this.input.step) || 1;

        if (value < min) {
          this.input.value = min;
        } else if (max && value > max) {
          this.input.value = max;
        } else if ((value - min) % step !== 0) {
          this.input.value = min + Math.floor((value - min) / step) * step;
        }

        this.updateButtons();
      }

      updateButtons() {
        const value = parseInt(this.input.value);
        const min = parseInt(this.input.min) || 1;
        const max = this.input.max ? parseInt(this.input.max) : null;

        this.minusButton.disabled = value <= min;
        this.plusButton.disabled = max && value >= max;
      }
    }
  );
}