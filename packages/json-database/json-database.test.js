const { normalizeDescription } = require('./json-database')

describe('normalizeDescription', () => {
    it('case1', () => {
        const normalized = normalizeDescription('aaaaaaa aaaaaaa    a')
        normalized.should.be.equal('AAAAAAA AAAAAAA')
    })

    it('case2', () => {
        const normalized = normalizeDescription('aaaaaaa aaaaaaa    a    ')
        normalized.should.be.equal('AAAAAAA AAAAAAA')
    })

    it('case3', () => {
        const normalized = normalizeDescription('aaaaaaa aaaaaaa a ')
        normalized.should.be.equal('AAAAAAA AAAAAAA')
    })

    it('case4', () => {
        const normalized = normalizeDescription('aaaaaaa aaaaaaa a')
        normalized.should.be.equal('AAAAAAA AAAAAAA')
    })

    it('case5', () => {
        const normalized = normalizeDescription('aaaaaaa aaaaaaa aa')
        normalized.should.be.equal('AAAAAAA AAAAAAA')
    })

    it('case6', () => {
        const normalized = normalizeDescription('aaaaaaa aaaaaaa aa ')
        normalized.should.be.equal('AAAAAAA AAAAAAA')
    })

    it('case7', () => {
        const normalized = normalizeDescription('LA FEE CAFE')
        normalized.should.be.equal('LA FEE CAFE')
    })

    it('case8', () => {
        const normalized = normalizeDescription('COMPRA CARTAO - COMPRA NO ESTABELECIMENTO HABIBS S')
        normalized.should.be.equal('COMPRA CARTAO COMPRA NO ESTABELECIMENTO HABIBS')
    })

    it('case9', () => {
        const normalized = normalizeDescription('GOOGLE PLAY NIANTIC IN 2')
        normalized.should.be.equal('GOOGLE PLAY NIANTIC IN')
    })

    it('case10', () => {
        const normalized = normalizeDescription('PAGAMENTO DE CONVENIO - LUZ')
        normalized.should.be.equal('PAGAMENTO DE CONVENIO LUZ')
    })

    it('case11', () => {
        const normalized = normalizeDescription('./"@abc|[123]+=,?{}')
        normalized.should.be.equal('ABC123')
    })
})
