<script>
export default {


  mounted() {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-B24WEF5K6V');

    window.addEventListener('DOMContentLoaded', function () {
      setupGtag();
      addSearchParams()
    })

    function addSearchParams() {
      const searchParams = new URLSearchParams(window.location.search);

      const courseInput = document.getElementById("course");
      const courseNumberInput = document.getElementById("course_number");
      const sortByInput = document.getElementById("sort_by");
      const submitBtn = document.getElementById("submit_btn");

      courseInput.value = searchParams.get("course");
      courseNumberInput.value = searchParams.get("number");
      if(searchParams.get("sort_by")){
        sortByInput.value = searchParams.get("sort_by")
      }

      if (searchParams.get("course") && searchParams.get("number")) {
        submitBtn.click();
      }}

    function setupGtag() {
      let courseElem = document.getElementById('course');
      let courseNumberElem = document.getElementById('course_number');
      let sortByElem = document.getElementById('sort_by');
      let submitBtnElem = document.getElementById('submit_btn');
      courseElem.onclick = function () {
        gtag('event', 'clicked_course');
      }

      courseNumberElem.onclick = function () {
        gtag('event', 'clicked_course_number');
      }

      sortByElem.onclick = function () {
        gtag('event', 'clicked_sort_by');
      }

      submitBtnElem.onclick = function () {
        gtag('event', 'clicked_submit_btn', {
          course: courseElem.value,
          course_number: courseNumberElem.value,
          sort_by: sortByElem.value,
        });
      }
    }
  }
}
</script>
<template>

  <v-app>
    <v-container fluid="true">
      <h1 class="title"> TAMU Free Grade Distribution</h1>

      <div class="row">

        <div class="col-12 d-flex justify-content-center mt-2 mt-sm-0 px-4">
          <div class="row">
            <div class="col-12">
              <p class="text-center fs-5">Enter the course information below and press submit. Golden rows are Honors only.</p>
            </div>
            <div class="col-12 col-lg-6 offset-lg-3">
              <form action="results.php" method="post" id="myForm">

                <div class="row">
                  <div class="col-12 col-sm-6">
                    <div class="form-floating mb-3">
                      <input name="course" id="course" value="" type="text" class="form-control" form="myForm" maxlength="4"/>
                      <label class="inputText">Course (Ex: CSCE)</label>
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="form-floating mb-3">
                      <input name="course_number" id="course_number" value="" type="tel" class="form-control" form="myForm"/>
                      <label class="inputText">Course Number (Ex: 111)</label>
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="form-floating mb-3">
                      <select name="sort_by" id="sort_by" class="form-select" form="myForm">
                        <option value="1">GPA</option>
                        <option value="2">Professor Last Name</option>
                      </select>
                      <label class="inputText">Sort By: </label>
                    </div>

                  </div>
                  <div class="col-12 col-sm-6 mt-sm-2">
                    <input type="submit" name="submit_btn" id="submit_btn" value="Submit" class="btn btn-dark form-control" />
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>

        <div class="col-12 mb-2">
          <h5 class="suggestion"> Data from Spring 2012 - Fall 2022</h5>
          <h5 class="suggestion"> <a href="mailto: jippylong12@gmail.com">Email</a> for suggestions</h5>
          <h5 class="suggestion"><a href="http://www.jippylong12.xyz">Me</a></h5>
        </div>

        <div class="col-12 px-4">
          <p class="text-center"> I want this to be helpful to all students. </p>
          <p class="text-center">An education is the best indicator of success, but you don't have to be dumb going about getting one.</p>
          <p class="text-center"> I will keep updating the course data as long as I can.</p>
          <ul class="text-center">
            <li><a href="https://github.com/jippylong12/TAMU_FGD_FRONT_END"> Front-end Code</a></li>
            <li><a href="https://github.com/jippylong12/TAMU_FGD">Server Code</a></li>
            <li><a href="https://drive.google.com/drive/folders/0B6WlnfAGiKk9ZlEwcElEZW9rUE0?resourcekey=0-bkINHRtazSza6dDL8MIyIg&usp=sharing"> CSV DB Files</a></li>
          </ul>
        </div>
        <div class="col-12">
          <p style="text-align: center"><b>I'm glad this website is helping people. </b> </p>
        </div>
      </div>

      <br>
      <div>
        <h5 class="suggestion"> Thanks & Acknowledgements</h5>
        <h5 class="credits">
          <b>My Momma: #1</b><br>
          <b>Matthew:</b> adding the Q drop column.<br>
          <b>Zubin:</b> Pointing out the averaging problem.<br>
          <b>Eric:</b> Suggesting to distinguish honors sections.
        </h5>
      </div>
    </v-container>
  </v-app>

</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
