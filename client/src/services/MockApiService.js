import {
  mockExams,
  mockQuestions,
  mockSubmissions,
  mockUsers,
} from '../data'

class MockApiService {
  constructor(storageService) {
    this.storageService = storageService
    this.collections = {
      users: mockUsers,
      exams: mockExams,
      questions: mockQuestions,
      submissions: mockSubmissions,
    }
  }

  getCollection(collectionName) {
    const initialData = this.collections[collectionName] ?? []
    return this.storageService.load(collectionName, initialData)
  }

  saveCollection(collectionName, items) {
    this.storageService.save(collectionName, items)
    return items
  }

  getAll(collectionName) {
    return Promise.resolve(this.getCollection(collectionName))
  }

  getById(collectionName, id) {
    const item = this.getCollection(collectionName).find(
      (currentItem) => currentItem.id === id,
    )

    return Promise.resolve(item ?? null)
  }

  create(collectionName, item) {
    const items = this.getCollection(collectionName)
    const nextItems = [...items, item]

    this.saveCollection(collectionName, nextItems)

    return Promise.resolve(item)
  }

  update(collectionName, id, updates) {
    const items = this.getCollection(collectionName)
    let updatedItem = null

    const nextItems = items.map((item) => {
      if (item.id !== id) {
        return item
      }

      updatedItem = { ...item, ...updates }
      return updatedItem
    })

    this.saveCollection(collectionName, nextItems)

    return Promise.resolve(updatedItem)
  }

  remove(collectionName, id) {
    const items = this.getCollection(collectionName)
    const nextItems = items.filter((item) => item.id !== id)

    this.saveCollection(collectionName, nextItems)

    return Promise.resolve(id)
  }

  reset(collectionName) {
    this.storageService.remove(collectionName)
    return Promise.resolve(this.getCollection(collectionName))
  }
}

export default MockApiService
