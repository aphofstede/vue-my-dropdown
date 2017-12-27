import Vue from 'vue'
import assert from 'assert'
import dropdown from 'src/vue-my-dropdown.vue'

const createDropdown = (visible = false, position = undefined, animation = undefined) => {
  const template =
    `<div>
        <dropdown :visible="visible" :position="position" :animation="animation" ref="dropdown"
        @clickout="visible = false">
          <span @click="visible = !visible" :style="linkStyle">link</span>
          <div slot="dropdown">
            <div :style="ddStyle">Dialog</div>
          </div>
        </dropdown>
    </div>`

  let body = window.document.body
  let div = window.document.createElement('div')
  body.innerHTML = ''
  div.id = 'app'
  body.insertBefore(div, body.children[0])
  body.style.padding = '0'
  body.style.margin = '0'

  return new Vue({
    el: '#app',
    template: template,
    components: { dropdown },
    data: {
      visible: visible,
      position: position,
      animation: animation,
      linkStyle: {
        display: 'inline-block',
        height: '100px',
        width: '100px'
      },
      ddStyle: {
        display: 'block',
        height: '100px',
        width: '100px'
      },
      clickOut: 1
    }
  })
}

describe('vue-my-dropdown.vue', () => {
  describe('visible property', () => {
    it('Check it', () => {
      let vm = createDropdown()
      let component = vm.$refs.dropdown

      assert.equal(component.visible, false)
      assert.equal(vm.$el.querySelector('.my-dropdown-dd').style.display, 'none')

      vm = createDropdown(true)
      component = vm.$refs.dropdown

      assert.equal(component.visible, true)
      assert.equal(vm.$el.querySelector('.my-dropdown-dd').style.display, '')
    })
  })

  describe('Position property', () => {
    const horizontal = ['left', 'center', 'right']
    const vertical = ['top', 'center', 'bottom']

    const calculatePosition = (p1, p2, p3, p4) => {
      let [ddh, ddv] = [100, 100]
      let [lh, lv] = [100, 100]
      let left, top

      left = p1 === 'left' ? 0 : (p1 === 'center' ? lh / 2 : lh)
      top = p2 === 'top' ? 0 : (p2 === 'center' ? lv / 2 : lv)
      left += p3 === 'left' ? 0 : (p3 === 'center' ? -(ddh / 2) : -(ddh))
      top += p4 === 'top' ? 0 : (p4 === 'center' ? -(ddv / 2) : -(ddv))

      return { left: left + 'px', top: top + 'px' }
    }

    it('Check it styles generated depending of position', () => {
      for (let p1 of horizontal) {
        for (let p2 of vertical) {
          for (let p3 of horizontal) {
            for (let p4 of vertical) {
              let vm = createDropdown(true, [p1, p2, p3, p4])
              let component = vm.$refs.dropdown
              let position = calculatePosition(p1, p2, p3, p4)

              assert.equal(component.ddStyle.position, 'absolute')
              assert.equal(component.ddStyle.left, position.left, [p1, p2, p3, p4].join(' '))
              assert.equal(component.ddStyle.top, position.top, [p1, p2, p3, p4].join(' '))
              assert.equal(component.ddStyle.transformOrigin, p3 + ' ' + p4)
            }
          }
        }
      }
    })

    it('Default value', () => {
      let vm = createDropdown(true)
      let truePosition = calculatePosition('right', 'top', 'left', 'top')
      let dropdown = vm.$refs.dropdown

      assert.equal(dropdown.ddStyle.left, truePosition.left)
      assert.equal(dropdown.ddStyle.top, truePosition.top)
    })

    describe('Apply styles', () => {
      let elStyle, ddStyle

      beforeEach(done => {
        const vm = createDropdown(true)
        vm.$nextTick(() => {
          elStyle = vm.$el.querySelector('.my-dropdown-dd').style
          ddStyle = vm.$refs.dropdown.ddStyle
          done()
        })
      })

      it('Check it', () => {
        assert.equal(elStyle.position, ddStyle.position)
        assert.equal(elStyle.top, ddStyle.top)
        assert.equal(elStyle.left, ddStyle.left)
        assert.equal(elStyle.webkitTransformOrigin, 'left top 0px')
      })
    })
  })

  describe('Animation property', () => {
    it('Default', () => {
      let vm = createDropdown(true)
      assert.equal(vm.$refs.dropdown.animation, 'ani-slide')
    })

    it('Custom', () => {
      let vm = createDropdown(true, undefined, 'ani-custom')
      assert.equal(vm.$refs.dropdown.animation, 'ani-custom')
    })
  })

  describe('Click out event', () => {
    const vm = createDropdown(true)

    before(done => {
      vm.$mount()
      setTimeout(() => {
        window.document.dispatchEvent(new window.Event('click'))
        Vue.nextTick(() => { done() })
      }, 100)
    })

    it('click out', () => {
      assert.equal(vm.visible, false)
    })
  })
})
