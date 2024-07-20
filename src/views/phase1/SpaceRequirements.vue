<template>
  <div class="space-main">
    <Button theme="submit" class="add-space-button">Add Space</Button>
    <Input placeholder="Search Space" />
    <div class="space-container">
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">This is a very long text testing for elipsis. This is only when the text overflow, so that it would be hidden. This is not done yet guys. If not enough, you can shrink down a bit your browser to see the effect. This section also clickable to edit or view.</div>
      </div>
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">This is a bit shorter text</div>
      </div>
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">Somewhat longer than previous, but still shorter than the first</div>
      </div>
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">Short</div>
      </div>
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">Just a random text, I don't know what to write anymore</div>
      </div>
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">Please help me, I'm running out of ideas</div>
      </div>
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">I'm doing this at 1:30AM :'(</div>
      </div>
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">Hope all this is worth it</div>
      </div>
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">I'm sleepy</div>
      </div>
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">Texted Shern, but no reply</div>
      </div>
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">Been doing since 11PM just now</div>
      </div>
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">Today is 20th July</div>
      </div>
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">Oh sheet, actually it is already 21st</div>
      </div>
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">Hahaha</div>
      </div>
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">Btw, guys, gotten a new job</div>
      </div>
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">And already resigned from CIMB.</div>
      </div>
      <div class="space-details">
        <div class="space-title">Name</div>
        <div class="space-description-container">Bye bye</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {} from 'vue';
</script>

<style scoped>
.space-main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.add-space-button {
  width: fit-content;
  align-self: flex-end;
}
.space-container {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: auto;
  margin-top: 10px;
}
.space-details {
  display: flex;
  flex-direction: column;
  border: 1px solid gray;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
}
.space-details:not(:first-child) {
  margin-top: 10px;
}
.space-title {
  font-size: 1.2em;
  font-weight: bold;
}
.space-description-container {
  align-items: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>